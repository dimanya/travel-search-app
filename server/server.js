import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();

// Render (и любой хостинг) сам подставляет PORT через переменную окружения
const PORT = process.env.PORT || 3000;

// Разрешённый фронтенд-домен: в .env локально — localhost,
// в проде — домен Vercel
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3001';

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json());

// ===== Demo storage for trips =====
let trips = [
  { id: 1, from: 'LAX', to: 'JFK', date: '2025-11-05', price: 199 },
  { id: 2, from: 'SFO', to: 'SEA', date: '2025-11-10', price: 89 }
];

// ----- API: list trips -----
app.get('/api/trips', (req, res) => {
  const { from, to } = req.query;
  let result = trips;
  if (from) result = result.filter(t => t.from.toLowerCase() === String(from).toLowerCase());
  if (to)   result = result.filter(t => t.to.toLowerCase() === String(to).toLowerCase());
  res.json(result);
});

// ----- API: add trip -----
app.post('/api/trips', (req, res) => {
  const { from, to, date, price } = req.body || {};
  if (!from || !to || !date || typeof price !== 'number') {
    return res.status(400).json({ error: 'from, to, date, price (number) обязательны' });
  }
  const id = trips.length ? Math.max(...trips.map(t => t.id)) + 1 : 1;
  const trip = { id, from, to, date, price };
  trips.push(trip);
  res.status(201).json(trip);
});

// ===== AI Planner (OpenAI + fallback) =====
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function demoPlan({ origin = 'Los Angeles', days = 3 }) {
  const cities = ['Santa Monica', 'Malibu', 'Santa Barbara', 'San Diego', 'Palm Springs'];
  const planDays = Array.from({ length: days }).map((_, i) => {
    const city = cities[i % cities.length];
    return {
      day: i + 1,
      city,
      summary: `День ${i + 1} в ${city}: пляж, прогулки и еда.`,
      activities: [
        { time: '09:00', name: 'Завтрак', note: 'Кафе у океана', estCost: 15 },
        { time: '11:00', name: 'Пляж / прогулка', note: 'Берём воду и крем' },
        { time: '15:00', name: 'Обед', note: 'Фиш-тако', estCost: 18 },
        { time: '19:00', name: 'Закат', note: 'Смотровая площадка' }
      ],
      estDailyCost: 60
    };
  });
  return {
    title: `Маршрут на ${days} дня из ${origin}`,
    days: planDays,
    totalEstimatedCost: planDays.reduce((s, d) => s + (d.estDailyCost || 0), 0),
    tips: ['Бронируй отели заранее', 'Смотри трафик по времени', 'Удобная обувь обязательна']
  };
}

app.post('/api/plan', async (req, res) => {
  const { origin = 'Los Angeles', days = 3, budget = 'medium', interests = 'beaches, food' } = req.body || {};

  // Принудительный демо-режим (на случай отсутствия квоты или для презентации)
  if (String(process.env.USE_DEMO_PLAN || '').toLowerCase() === 'true') {
    return res.json(demoPlan({ origin, days }));
  }

  try {
    const userPrompt =
      `Create a ${days}-day travel plan starting from ${origin}. Budget: ${budget}. Interests: ${interests}. ` +
      `Return ONLY valid JSON with fields: {title, days:[{day,city,summary,activities:[{time,name,note,estCost}], estDailyCost}], totalEstimatedCost, tips}. ` +
      `Estimates in USD, concise summaries.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful travel planner. Respond ONLY with JSON, no markdown.' },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' } // мягкий формат вместо json_schema
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    let json;
    try {
      json = JSON.parse(content);
    } catch {
      console.warn('JSON parse failed, content=', content);
      return res.json(demoPlan({ origin, days }));
    }
    if (!json || !json.title || !Array.isArray(json.days)) {
      console.warn('AI returned unexpected shape, content=', content);
      return res.json(demoPlan({ origin, days }));
    }
    return res.json(json);
  } catch (err) {
    const status = err?.status || err?.response?.status;
    console.error('AI_PLAN_FAILED', status, err?.message);
    // Fallback, чтобы UI всегда получал план
    return res.json(demoPlan({ origin, days }));
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
