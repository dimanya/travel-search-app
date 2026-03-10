#!/usr/bin/env node
/**
 * Generate static HTML pages with SEO content (no Puppeteer needed).
 * Reads routes-data.js and blog-data.js, creates HTML files with
 * proper meta tags and visible text content for search engines.
 * 
 * Run after vite build: node generate-static-html.js
 * Works on Vercel (no Chrome dependency).
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'client', 'dist');
const BASE_URL = 'https://travelsearch.now';

// Read the built index.html as template
const indexHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

// Parse routes
const routesFile = fs.readFileSync(path.join(__dirname, 'client/src/routes-data.js'), 'utf8');
const routeMatches = [...routesFile.matchAll(
  /\{\s*from:\s*'([A-Z]{3})',\s*to:\s*'([A-Z]{3})',\s*fromCity_ru:\s*'([^']*)',\s*toCity_ru:\s*'([^']*)',\s*fromCity_en:\s*'([^']*)',\s*toCity_en:\s*'([^']*)'/g
)];

// Parse blog posts
const blogFile = fs.readFileSync(path.join(__dirname, 'client/src/blog-data.js'), 'utf8');
const slugMatches = [...blogFile.matchAll(/slug:\s*'([^']+)'/g)];
const titleEnMatches = [...blogFile.matchAll(/title_en:\s*'([^']+)'/g)];
const titleRuMatches = [...blogFile.matchAll(/title_ru:\s*'([^']+)'/g)];
const descEnMatches = [...blogFile.matchAll(/desc_en:\s*'([^']+)'/g)];
const descRuMatches = [...blogFile.matchAll(/desc_ru:\s*'([^']+)'/g)];

// Get unique origin cities
const cityMap = new Map();
routeMatches.forEach(m => {
  if (!cityMap.has(m[1])) {
    cityMap.set(m[1], { code: m[1], en: m[5], ru: m[3] });
  }
});

function generatePage({ title, description, canonical, hreflangEn, hreflangRu, h1, bodyContent }) {
  let html = indexHtml;
  
  // Replace title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escHtml(title)}</title>`
  );
  
  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${escAttr(description)}">`
  );
  
  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${canonical}">`
  );
  
  // Replace OG tags
  html = html.replace(
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${escAttr(title)}">`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${escAttr(description)}">`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${canonical}">`
  );
  
  // Add hreflang
  const hreflangTags = `
    <link rel="alternate" hreflang="en" href="${hreflangEn}" />
    <link rel="alternate" hreflang="ru" href="${hreflangRu}" />`;
  html = html.replace('</head>', `${hreflangTags}\n</head>`);
  
  // Add SEO content inside noscript + hidden div (visible to crawlers, hidden from JS users)
  const seoBlock = `
    <noscript>
      <div style="max-width:800px;margin:0 auto;padding:20px;">
        <h1>${escHtml(h1)}</h1>
        ${bodyContent}
      </div>
    </noscript>
    <div id="seo-content" style="display:none" aria-hidden="true">
      <h1>${escHtml(h1)}</h1>
      ${bodyContent}
    </div>`;
  
  html = html.replace('<div id="root"></div>', `<div id="root"></div>${seoBlock}`);
  
  return html;
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s) { return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

function writePage(routePath, html) {
  const outDir = path.join(DIST, routePath);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
}

let count = 0;

// ── Flight route pages ──
for (const m of routeMatches) {
  const [_, from, to, fromRu, toRu, fromEn, toEn] = m;
  const slug = `${from.toLowerCase()}-${to.toLowerCase()}`;
  
  for (const lang of ['en', 'ru']) {
    const isRu = lang === 'ru';
    const fromCity = isRu ? fromRu : fromEn;
    const toCity = isRu ? toRu : toEn;
    
    const title = isRu
      ? `Дешёвые авиабилеты ${fromCity} → ${toCity} | Travel Search App`
      : `Cheap flights ${fromCity} → ${toCity} | Travel Search App`;
    
    const desc = isRu
      ? `Найди дешёвые авиабилеты из ${fromCity} в ${toCity}. Сравни цены авиакомпаний, выбери лучшее предложение.`
      : `Find cheap flights from ${fromCity} to ${toCity}. Compare airline prices, pick the best deal.`;
    
    const h1 = isRu
      ? `Дешёвые авиабилеты ${fromCity} → ${toCity}`
      : `Cheap flights ${fromCity} → ${toCity}`;
    
    const body = isRu
      ? `<p>Сравните цены на авиабилеты из ${fromCity} (${from}) в ${toCity} (${to}). Лучшие предложения от авиакомпаний с партнёрскими ссылками Aviasales.</p>
         <p><a href="${BASE_URL}/ru/flights">← Все маршруты</a></p>`
      : `<p>Compare flight prices from ${fromCity} (${from}) to ${toCity} (${to}). Best deals from airlines with Aviasales affiliate links.</p>
         <p><a href="${BASE_URL}/en/flights">← All routes</a></p>`;
    
    writePage(`${lang}/flights/${slug}`, generatePage({
      title, description: desc,
      canonical: `${BASE_URL}/${lang}/flights/${slug}`,
      hreflangEn: `${BASE_URL}/en/flights/${slug}`,
      hreflangRu: `${BASE_URL}/ru/flights/${slug}`,
      h1, bodyContent: body,
    }));
    count++;
  }
}

// ── City hub pages ──
for (const [code, city] of cityMap) {
  for (const lang of ['en', 'ru']) {
    const isRu = lang === 'ru';
    const cityName = isRu ? city.ru : city.en;
    const slug = code.toLowerCase();
    
    // Find all destinations from this city
    const dests = routeMatches
      .filter(m => m[1] === code)
      .map(m => isRu ? m[4] : m[6]);
    
    const title = isRu
      ? `Дешёвые рейсы из ${cityName} | Travel Search App`
      : `Cheap flights from ${cityName} | Travel Search App`;
    
    const desc = isRu
      ? `Все направления из ${cityName}. Дешёвые авиабилеты в ${dests.slice(0,5).join(', ')} и другие города.`
      : `All destinations from ${cityName}. Cheap flights to ${dests.slice(0,5).join(', ')} and more.`;
    
    const destLinks = dests.map(d => `<li>${d}</li>`).join('');
    const body = `<p>${isRu ? 'Популярные направления из' : 'Popular destinations from'} ${cityName}:</p><ul>${destLinks}</ul>`;
    
    writePage(`${lang}/flights/from/${slug}`, generatePage({
      title, description: desc,
      canonical: `${BASE_URL}/${lang}/flights/from/${slug}`,
      hreflangEn: `${BASE_URL}/en/flights/from/${slug}`,
      hreflangRu: `${BASE_URL}/ru/flights/from/${slug}`,
      h1: isRu ? `Рейсы из ${cityName}` : `Flights from ${cityName}`,
      bodyContent: body,
    }));
    count++;
  }
}

// ── Blog pages ──
for (let i = 0; i < slugMatches.length; i++) {
  const slug = slugMatches[i][1];
  const titleEn = titleEnMatches[i]?.[1] || slug;
  const titleRu = titleRuMatches[i]?.[1] || slug;
  const descEn = descEnMatches[i]?.[1] || '';
  const descRu = descRuMatches[i]?.[1] || '';
  
  for (const lang of ['en', 'ru']) {
    const isRu = lang === 'ru';
    const title = `${isRu ? titleRu : titleEn} | Travel Search App`;
    const desc = isRu ? descRu : descEn;
    
    writePage(`${lang}/blog/${slug}`, generatePage({
      title, description: desc,
      canonical: `${BASE_URL}/${lang}/blog/${slug}`,
      hreflangEn: `${BASE_URL}/en/blog/${slug}`,
      hreflangRu: `${BASE_URL}/ru/blog/${slug}`,
      h1: isRu ? titleRu : titleEn,
      bodyContent: `<p>${escHtml(desc)}</p><p><a href="${BASE_URL}/${lang}/blog">← ${isRu ? 'Все статьи' : 'All articles'}</a></p>`,
    }));
    count++;
  }
}

// ── Index pages ──
for (const lang of ['en', 'ru']) {
  const isRu = lang === 'ru';
  
  // Flights index
  const routeLinks = routeMatches.slice(0, 20).map(m => {
    const fromCity = isRu ? m[3] : m[5];
    const toCity = isRu ? m[4] : m[6];
    return `<li><a href="${BASE_URL}/${lang}/flights/${m[1].toLowerCase()}-${m[2].toLowerCase()}">${fromCity} → ${toCity}</a></li>`;
  }).join('');
  
  writePage(`${lang}/flights`, generatePage({
    title: isRu ? 'Все маршруты — дешёвые авиабилеты | Travel Search App' : 'All routes — cheap flights | Travel Search App',
    description: isRu ? 'Поиск дешёвых авиабилетов по 200+ маршрутам.' : 'Search cheap flights across 200+ routes.',
    canonical: `${BASE_URL}/${lang}/flights`,
    hreflangEn: `${BASE_URL}/en/flights`, hreflangRu: `${BASE_URL}/ru/flights`,
    h1: isRu ? 'Все авиамаршруты' : 'All flight routes',
    bodyContent: `<ul>${routeLinks}</ul>`,
  }));
  count++;
  
  // Blog index
  const blogLinks = slugMatches.map((m, i) => {
    const title = isRu ? titleRuMatches[i]?.[1] : titleEnMatches[i]?.[1];
    return `<li><a href="${BASE_URL}/${lang}/blog/${m[1]}">${title || m[1]}</a></li>`;
  }).join('');
  
  writePage(`${lang}/blog`, generatePage({
    title: isRu ? 'Блог о путешествиях | Travel Search App' : 'Travel Blog | Travel Search App',
    description: isRu ? 'Статьи о дешёвых перелётах, бюджетных путешествиях и лайфхаках.' : 'Articles about cheap flights, budget travel and tips.',
    canonical: `${BASE_URL}/${lang}/blog`,
    hreflangEn: `${BASE_URL}/en/blog`, hreflangRu: `${BASE_URL}/ru/blog`,
    h1: isRu ? 'Блог о путешествиях' : 'Travel Blog',
    bodyContent: `<ul>${blogLinks}</ul>`,
  }));
  count++;
}

console.log(`✅ Generated ${count} static HTML pages with SEO content.`);
