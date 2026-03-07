#!/usr/bin/env node
/**
 * Telegram Deals Bot — fetches cheapest flights from Travelpayouts
 * and posts them to @travelsearch_deals channel.
 * 
 * Run via cron: every 6 hours
 * node telegram-deals.js
 */
import dotenv from 'dotenv';
dotenv.config();

const BOT_TOKEN = process.env.TG_DEALS_BOT_TOKEN || '8503625543:AAGu3UnOcOKt6Ax6rpVpYA2ds2eYQ_jB2nI';
const CHANNEL = process.env.TG_DEALS_CHANNEL || '@travelsearch_deals';
const TP_TOKEN = process.env.TRAVELPAYOUTS_TOKEN || '';
const TP_MARKER = process.env.TRAVELPAYOUTS_MARKER || '681967';
const TP_BASE = 'https://api.travelpayouts.com/aviasales/v3';
const SITE_BASE = 'https://travelsearch.now';

// Popular origin cities to check
const ORIGINS = [
  { code: 'MOW', name: '🇷🇺 Москва', nameEn: 'Moscow' },
  { code: 'LED', name: '🇷🇺 Санкт-Петербург', nameEn: 'St Petersburg' },
  { code: 'LAX', name: '🇺🇸 Лос-Анджелес', nameEn: 'Los Angeles' },
  { code: 'JFK', name: '🇺🇸 Нью-Йорк', nameEn: 'New York' },
  { code: 'SFO', name: '🇺🇸 Сан-Франциско', nameEn: 'San Francisco' },
  { code: 'ORD', name: '🇺🇸 Чикаго', nameEn: 'Chicago' },
  { code: 'MIA', name: '🇺🇸 Майами', nameEn: 'Miami' },
  { code: 'LON', name: '🇬🇧 Лондон', nameEn: 'London' },
  { code: 'PAR', name: '🇫🇷 Париж', nameEn: 'Paris' },
  { code: 'IST', name: '🇹🇷 Стамбул', nameEn: 'Istanbul' },
];

// City name mapping for destinations
const CITY_NAMES = {
  'AYT': '🇹🇷 Анталья', 'IST': '🇹🇷 Стамбул', 'DXB': '🇦🇪 Дубай',
  'LED': '🇷🇺 СПб', 'SVO': '🇷🇺 Москва', 'MOW': '🇷🇺 Москва',
  'TBS': '🇬🇪 Тбилиси', 'EVN': '🇦🇲 Ереван', 'AER': '🇷🇺 Сочи',
  'BKK': '🇹🇭 Бангкок', 'NRT': '🇯🇵 Токио', 'HND': '🇯🇵 Токио',
  'CDG': '🇫🇷 Париж', 'LHR': '🇬🇧 Лондон', 'BCN': '🇪🇸 Барселона',
  'FCO': '🇮🇹 Рим', 'AMS': '🇳🇱 Амстердам', 'BER': '🇩🇪 Берлин',
  'MAD': '🇪🇸 Мадрид', 'LIS': '🇵🇹 Лиссабон', 'PRG': '🇨🇿 Прага',
  'VIE': '🇦🇹 Вена', 'MUC': '🇩🇪 Мюнхен', 'FRA': '🇩🇪 Франкфурт',
  'JFK': '🇺🇸 Нью-Йорк', 'LAX': '🇺🇸 Лос-Анджелес', 'MIA': '🇺🇸 Майами',
  'SFO': '🇺🇸 Сан-Франциско', 'ORD': '🇺🇸 Чикаго', 'SEA': '🇺🇸 Сиэтл',
  'CUN': '🇲🇽 Канкун', 'MEX': '🇲🇽 Мехико', 'BOG': '🇨🇴 Богота',
  'GRU': '🇧🇷 Сан-Паулу', 'LIM': '🇵🇪 Лима', 'SIN': '🇸🇬 Сингапур',
  'HKG': '🇭🇰 Гонконг', 'ICN': '🇰🇷 Сеул', 'DEL': '🇮🇳 Дели',
  'BOM': '🇮🇳 Мумбаи', 'KUL': '🇲🇾 Куала-Лумпур', 'BAK': '🇦🇿 Баку',
  'TAS': '🇺🇿 Ташкент', 'ALA': '🇰🇿 Алматы', 'ATL': '🇺🇸 Атланта',
  'DEN': '🇺🇸 Денвер', 'BOS': '🇺🇸 Бостон', 'LAS': '🇺🇸 Лас-Вегас',
  'DFW': '🇺🇸 Даллас', 'PHX': '🇺🇸 Финикс',
};

function getCityName(code) {
  return CITY_NAMES[code] || code;
}

const API_BASE = process.env.API_BASE || 'https://travel-search-app-b6cw.onrender.com';

async function fetchCheapest(origin) {
  // Use our own Render backend (it has Travelpayouts token)
  const url = `${API_BASE}/api/trips?from=${origin}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.map(t => ({
      origin: t.from,
      destination: t.to,
      price: t.price,
      departure_at: t.date,
      return_at: t.returnDate,
      transfers: t.transfers,
      airline: t.airline,
      link: t.link,
    }));
  } catch (e) {
    console.error(`Fetch error for ${origin}:`, e.message);
    return [];
  }
}

function buildAviasalesLink(ticket) {
  const origin = (ticket.origin || '').toUpperCase();
  const dest = (ticket.destination || '').toUpperCase();
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

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatDeal(origin, ticket) {
  const dest = getCityName(ticket.destination);
  const price = ticket.price;
  const date = formatDate(ticket.departure_at);
  const transfers = ticket.transfers === 0 ? '✅ прямой' : `🔄 ${ticket.transfers} пер.`;
  const airline = ticket.airline || '';
  const link = ticket.link || buildAviasalesLink(ticket);
  const fromCode = (ticket.origin || origin.code).toLowerCase();
  const toCode = (ticket.destination || '').toLowerCase();
  const siteLink = `${SITE_BASE}/ru/flights/${fromCode}-${toCode}`;
  
  return `${origin.name} → ${dest}\n💰 <b>$${price}</b> · ${date} · ${transfers} · ${airline}\n🔗 <a href="${link}">Купить</a> · <a href="${siteLink}">Все рейсы</a>`;
}

async function sendToChannel(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  const data = await resp.json();
  if (!data.ok) console.error('Send error:', data.description);
  return data.ok;
}

async function run() {
  console.log(`[${new Date().toISOString()}] Starting deals fetch...`);
  
  // Pick 3-4 random origins each run for variety
  const shuffled = [...ORIGINS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4);
  
  const allDeals = [];
  
  for (const origin of selected) {
    const tickets = await fetchCheapest(origin.code);
    if (tickets.length > 0) {
      // Take top 2 cheapest per origin
      const top = tickets.slice(0, 2);
      for (const t of top) {
        allDeals.push({ origin, ticket: t });
      }
    }
    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }
  
  if (allDeals.length === 0) {
    console.log('No deals found');
    return;
  }
  
  // Sort by price
  allDeals.sort((a, b) => a.ticket.price - b.ticket.price);
  
  // Build message
  const lines = allDeals.slice(0, 8).map(d => formatDeal(d.origin, d.ticket));
  const header = `🔥 <b>Горящие билеты</b>\n\n`;
  const footer = `\n\n✈️ <a href="${SITE_BASE}">travelsearch.now</a> — сравни цены на все рейсы`;
  const message = header + lines.join('\n\n') + footer;
  
  const ok = await sendToChannel(message);
  console.log(ok ? `✅ Posted ${allDeals.length} deals` : '❌ Failed to post');
}

run().catch(console.error);
