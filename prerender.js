#!/usr/bin/env node
/**
 * Prerender script — builds static HTML for all routes using Puppeteer.
 * Run after `vite build`: node prerender.js
 * 
 * Generates pre-rendered HTML in client/dist/ so Google can index content.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'client', 'dist');

// ── Extract all routes ──
const routesFile = readFileSync(join(__dirname, 'client/src/routes-data.js'), 'utf8');
const routeMatches = [...routesFile.matchAll(/from:\s*'([A-Z]{3})',\s*to:\s*'([A-Z]{3})'/g)];

const blogFile = readFileSync(join(__dirname, 'client/src/blog-data.js'), 'utf8');
const slugMatches = [...blogFile.matchAll(/slug:\s*'([^']+)'/g)];

// Get unique origin city codes for city hub pages
const cityCodes = [...new Set(routeMatches.map(m => m[1].toLowerCase()))];

const routes = ['/'];
for (const lang of ['en', 'ru']) {
  routes.push(`/${lang}/flights`);
  routes.push(`/${lang}/blog`);
  for (const m of routeMatches) {
    routes.push(`/${lang}/flights/${m[1].toLowerCase()}-${m[2].toLowerCase()}`);
  }
  for (const m of slugMatches) {
    routes.push(`/${lang}/blog/${m[1]}`);
  }
  for (const code of cityCodes) {
    routes.push(`/${lang}/flights/from/${code}`);
  }
}

console.log(`📦 Prerendering ${routes.length} routes...`);

// ── Start a local server ──
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname } from 'path';

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.xml': 'application/xml', '.txt': 'text/plain',
};

const server = createServer(async (req, res) => {
  let filePath = join(DIST, req.url === '/' ? 'index.html' : req.url);
  
  // SPA fallback
  if (!existsSync(filePath) || !extname(filePath)) {
    filePath = join(DIST, 'index.html');
  }
  
  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    const data = await readFile(join(DIST, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  }
});

await new Promise(resolve => server.listen(4173, resolve));
console.log('🌐 Local server on http://localhost:4173');

// ── Prerender with Puppeteer ──
const puppeteer = await import('puppeteer');
const browser = await puppeteer.default.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

let done = 0;
const CONCURRENCY = 4;

async function renderRoute(route) {
  const page = await browser.newPage();
  
  // Block unnecessary resources and API calls
  await page.setRequestInterception(true);
  page.on('request', req => {
    const type = req.resourceType();
    const url = req.url();
    if (['image', 'font', 'media'].includes(type) || url.includes('render.com') || url.includes('/api/') || url.includes('googletagmanager')) {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {

    await page.goto(`http://localhost:4173${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Give React a moment to render client-side
    await new Promise(r => setTimeout(r, 1500));

    const html = await page.content();

    // Determine output path
    const outPath = route === '/'
      ? join(DIST, 'index.html')
      : join(DIST, route, 'index.html');

    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    done++;
    
    if (done % 50 === 0 || done === routes.length) {
      console.log(`  ✅ ${done}/${routes.length}`);
    }
  } catch (err) {
    console.error(`  ❌ ${route}: ${err.message}`);
  } finally {
    await page.close();
  }
}

// Process in batches
for (let i = 0; i < routes.length; i += CONCURRENCY) {
  const batch = routes.slice(i, i + CONCURRENCY);
  await Promise.all(batch.map(renderRoute));
}

await browser.close();
server.close();

console.log(`\n🎉 Done! Prerendered ${done}/${routes.length} pages.`);
