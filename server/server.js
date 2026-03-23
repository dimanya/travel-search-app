import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

/* ───── Supabase ───── */
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

if (supabase) console.log('✅ Supabase connected');
else console.warn('⚠️  Supabase not configured — using in-memory fallback');

const app = express();
const PORT = process.env.PORT || 3000;

/* ───── CORS ───── */
const allowedOrigins = (
  process.env.CORS_ORIGIN || 'http://localhost:3001'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      console.warn('CORS blocked:', origin);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
);

app.use(express.json());

/* ───── Travelpayouts config ───── */
const TP_TOKEN = process.env.TRAVELPAYOUTS_TOKEN || '';
const TP_MARKER = process.env.TRAVELPAYOUTS_MARKER || '681967';
const TP_BASE = 'https://api.travelpayouts.com/aviasales/v3';

/* ───── No more demo data — return empty when no results ───── */

/* ───── API: search flights ───── */
app.get('/api/trips', async (req, res) => {
  const { from, to, date } = req.query;

  // If no search params → return empty (don't show fake data)
  if (!from && !to) {
    return res.json([]);
  }

  // If no Travelpayouts token → return empty
  if (!TP_TOKEN) {
    return res.json([]);
  }

  try {
    const params = new URLSearchParams({
      currency: 'usd',
      token: TP_TOKEN,
      limit: '30',
      sorting: 'price',
    });
    if (from) params.set('origin', from.toUpperCase());
    if (to) params.set('destination', to.toUpperCase());
    if (date) params.set('departure_at', date);

    const url = `${TP_BASE}/prices_for_dates?${params}`;
    const resp = await fetch(url);

    if (!resp.ok) {
      console.error('Travelpayouts error:', resp.status, await resp.text());
      return res.json([]);
    }

    const body = await resp.json();
    const fmtDate = (iso) => {
      if (!iso) return null;
      const d = new Date(iso);
      return d.toISOString().slice(0, 10); // "2026-05-09"
    };

    const data = (body.data || []).map((t, i) => ({
      id: i + 1,
      from: t.origin || from?.toUpperCase() || '—',
      to: t.destination || to?.toUpperCase() || '—',
      date: fmtDate(t.departure_at) || '—',
      returnDate: fmtDate(t.return_at),
      price: t.price ?? 0,
      airline: t.airline || '—',
      transfers: t.transfers ?? 0,
      // Партнёрская ссылка Aviasales с маркером
      link: buildAviasalesLink(t, from, to),
    }));

    return res.json(data);
  } catch (err) {
    console.error('Travelpayouts fetch failed:', err.message);
    return res.json([]);
  }
});

function buildAviasalesLink(ticket, from, to) {
  const origin = (ticket.origin || from || '').toUpperCase();
  const dest = (ticket.destination || to || '').toUpperCase();
  // Extract DDMM from departure date (e.g. "2026-05-09T22:07:00-07:00" → "0905")
  const depDate = ticket.departure_at ? new Date(ticket.departure_at) : null;
  const retDate = ticket.return_at ? new Date(ticket.return_at) : null;
  const fmt = (d) => String(d.getDate()).padStart(2, '0') + String(d.getMonth() + 1).padStart(2, '0');
  if (!depDate) return `https://www.aviasales.com/?marker=${TP_MARKER}`;
  const dep = fmt(depDate);
  const route = retDate
    ? `${origin}${dep}${dest}${fmt(retDate)}`
    : `${origin}${dep}${dest}1`;
  return `https://www.aviasales.com/search/${route}?marker=${TP_MARKER}`;
}

/* ───── API: add trip (kept for sandbox) ───── */
let customTrips = [];
app.post('/api/trips', (req, res) => {
  const { from, to, date, price } = req.body || {};
  if (!from || !to || !date || typeof price !== 'number') {
    return res.status(400).json({ error: 'from, to, date, price (number) обязательны' });
  }
  const id = customTrips.length ? Math.max(...customTrips.map((t) => t.id)) + 1 : 1;
  const trip = { id, from, to, date, price, airline: 'Custom', link: null };
  customTrips.push(trip);
  res.status(201).json(trip);
});

/* ───── Analytics: track affiliate clicks ───── */
const clickLogFallback = [];

app.post('/api/track-click', async (req, res) => {
  const { type, destination, origin, price, timestamp } = req.body || {};
  const entry = {
    type: type || 'unknown',
    destination: destination || '',
    origin: origin || '',
    price: price || null,
    timestamp: timestamp || new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.ip,
    ua: req.headers['user-agent'] || '',
  };

  if (supabase) {
    supabase.from('clicks').insert(entry).then(({ error }) => {
      if (error) console.error('Click insert error:', error);
    });
  } else {
    clickLogFallback.push(entry);
    if (clickLogFallback.length > 10000) clickLogFallback.splice(0, clickLogFallback.length - 10000);
  }

  console.log('CLICK:', entry.type, entry.destination);
  res.json({ ok: true });
});

app.get('/api/stats', async (req, res) => {
  if (supabase) {
    const { count: totalClicks } = await supabase.from('clicks').select('*', { count: 'exact', head: true });
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
    const { count: last24h } = await supabase.from('clicks').select('*', { count: 'exact', head: true }).gte('timestamp', oneDayAgo);
    const { data: typeCounts } = await supabase.rpc('click_stats_by_type').catch(() => ({ data: null }));

    return res.json({
      totalClicks: totalClicks || 0,
      last24h: last24h || 0,
      byType: typeCounts || {},
    });
  }

  const summary = { totalClicks: clickLogFallback.length, byType: {}, last24h: 0 };
  const oneDayAgo = Date.now() - 86400000;
  for (const c of clickLogFallback) {
    summary.byType[c.type] = (summary.byType[c.type] || 0) + 1;
    if (new Date(c.timestamp).getTime() > oneDayAgo) summary.last24h++;
  }
  res.json(summary);
});

/* ───── Email subscribe ───── */
const subscribersFallback = new Map();

app.post('/api/subscribe', async (req, res) => {
  const { email, lang } = req.body || {};
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  const normalized = email.trim().toLowerCase();
  const ip = req.headers['x-forwarded-for'] || req.ip;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .upsert({ email: normalized, lang: lang || 'en', ip }, { onConflict: 'email', ignoreDuplicates: true })
        .select();

      if (error && error.code === '23505') {
        return res.json({ status: 'exists' });
      }
      if (error) {
        console.error('Supabase subscribe error:', error);
        return res.status(500).json({ error: 'DB error' });
      }
      // Check if it was a new insert or existing
      const { count } = await supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('email', normalized);
      console.log('NEW_SUBSCRIBER:', normalized);
      return res.json({ status: 'ok' });
    } catch (err) {
      console.error('Subscribe error:', err.message);
    }
  }

  // Fallback to in-memory
  if (subscribersFallback.has(normalized)) {
    return res.json({ status: 'exists' });
  }
  subscribersFallback.set(normalized, { lang: lang || 'en', subscribedAt: new Date().toISOString(), ip });
  console.log('NEW_SUBSCRIBER (memory):', normalized);
  res.json({ status: 'ok' });
});

app.get('/api/subscribers/count', async (req, res) => {
  if (supabase) {
    const { count } = await supabase.from('subscribers').select('*', { count: 'exact', head: true });
    return res.json({ count: count || 0 });
  }
  res.json({ count: subscribersFallback.size });
});

/* ───── AI Planner (OpenAI + fallback) ───── */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function demoPlan({ origin = 'Los Angeles', days = 3, lang = 'ru' }) {
  const cities = ['Santa Monica', 'Malibu', 'Santa Barbara', 'San Diego', 'Palm Springs'];
  const isEn = lang === 'en';
  const planDays = Array.from({ length: days }).map((_, i) => {
    const city = cities[i % cities.length];
    return {
      day: i + 1,
      city,
      summary: isEn
        ? `Day ${i + 1} in ${city}: beach, walks and food.`
        : `День ${i + 1} в ${city}: пляж, прогулки и еда.`,
      activities: [
        { time: '09:00', name: isEn ? 'Breakfast' : 'Завтрак', note: isEn ? 'Café by the ocean' : 'Кафе у океана', estCost: 15 },
        { time: '11:00', name: isEn ? 'Beach / walk' : 'Пляж / прогулка', note: isEn ? 'Bring water and sunscreen' : 'Берём воду и крем' },
        { time: '15:00', name: isEn ? 'Lunch' : 'Обед', note: isEn ? 'Fish tacos' : 'Фиш-тако', estCost: 18 },
        { time: '19:00', name: isEn ? 'Sunset' : 'Закат', note: isEn ? 'Scenic viewpoint' : 'Смотровая площадка' },
      ],
      estDailyCost: 60,
    };
  });
  return {
    title: isEn
      ? `${days}-day itinerary from ${origin}`
      : `Маршрут на ${days} дня из ${origin}`,
    days: planDays,
    totalEstimatedCost: planDays.reduce((s, d) => s + (d.estDailyCost || 0), 0),
    tips: isEn
      ? ['Book hotels in advance', 'Check traffic times', 'Comfortable shoes are a must']
      : ['Бронируй отели заранее', 'Смотри трафик по времени', 'Удобная обувь обязательна'],
  };
}

app.post('/api/plan', async (req, res) => {
  const {
    origin = 'Los Angeles',
    days = 3,
    budget = 'medium',
    interests = 'beaches, food',
    lang = 'ru',
  } = req.body || {};

  if (String(process.env.USE_DEMO_PLAN || '').toLowerCase() === 'true') {
    return res.json(demoPlan({ origin, days, lang }));
  }

  try {
    const langInstruction = lang === 'en'
      ? 'Write all text in English.'
      : 'Write all text in Russian (Cyrillic).';

    const userPrompt =
      `Create a ${days}-day travel plan starting from ${origin}. Budget: ${budget}. Interests: ${interests}. ` +
      `${langInstruction} ` +
      `Return ONLY valid JSON with fields: {title, days:[{day,city,summary,activities:[{time,name,note,estCost}], estDailyCost}], totalEstimatedCost, tips}. ` +
      `Estimates in USD, concise summaries.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful travel planner. Respond ONLY with JSON, no markdown.',
        },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    let json;
    try {
      json = JSON.parse(content);
    } catch {
      console.warn('JSON parse failed, content=', content);
      return res.json(demoPlan({ origin, days, lang }));
    }
    if (!json || !json.title || !Array.isArray(json.days)) {
      console.warn('AI returned unexpected shape');
      return res.json(demoPlan({ origin, days, lang }));
    }
    return res.json(json);
  } catch (err) {
    console.error('AI_PLAN_FAILED', err?.status, err?.message);
    return res.json(demoPlan({ origin, days, lang }));
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
