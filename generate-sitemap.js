#!/usr/bin/env node
/**
 * Generate sitemap.xml from routes-data.js and blog-data.js
 */
const fs = require('fs');
const path = require('path');

// Parse routes from routes-data.js
const routesFile = fs.readFileSync(path.join(__dirname, 'client/src/routes-data.js'), 'utf8');
const routeMatches = [...routesFile.matchAll(/from:\s*'([A-Z]{3})',\s*to:\s*'([A-Z]{3})'/g)];
const routes = routeMatches.map(m => ({ from: m[1].toLowerCase(), to: m[2].toLowerCase() }));

// Parse blog slugs from blog-data.js
const blogFile = fs.readFileSync(path.join(__dirname, 'client/src/blog-data.js'), 'utf8');
const slugMatches = [...blogFile.matchAll(/slug:\s*'([^']+)'/g)];
const slugs = slugMatches.map(m => m[1]);

const BASE = 'https://travelsearch.now';
const langs = ['en', 'ru'];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${BASE}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

// Flights index
for (const lang of langs) {
  xml += `
  <url>
    <loc>${BASE}/${lang}/flights</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/flights"/>
    <xhtml:link rel="alternate" hreflang="ru" href="${BASE}/ru/flights"/>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
}

// Flight routes
for (const r of routes) {
  for (const lang of langs) {
    const other = lang === 'en' ? 'ru' : 'en';
    xml += `
  <url>
    <loc>${BASE}/${lang}/flights/${r.from}-${r.to}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/flights/${r.from}-${r.to}"/>
    <xhtml:link rel="alternate" hreflang="ru" href="${BASE}/ru/flights/${r.from}-${r.to}"/>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }
}

// Blog index
for (const lang of langs) {
  xml += `
  <url>
    <loc>${BASE}/${lang}/blog</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/blog"/>
    <xhtml:link rel="alternate" hreflang="ru" href="${BASE}/ru/blog"/>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}

// Blog posts
for (const slug of slugs) {
  for (const lang of langs) {
    xml += `
  <url>
    <loc>${BASE}/${lang}/blog/${slug}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/blog/${slug}"/>
    <xhtml:link rel="alternate" hreflang="ru" href="${BASE}/ru/blog/${slug}"/>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }
}

xml += `
</urlset>
`;

const outPath = path.join(__dirname, 'client/public/sitemap.xml');
fs.writeFileSync(outPath, xml);
// Also write to dist if it exists
const distPath = path.join(__dirname, 'client/dist/sitemap.xml');
if (fs.existsSync(path.dirname(distPath))) {
  fs.writeFileSync(distPath, xml);
}

const totalUrls = 1 + langs.length * 2 + routes.length * 2 + slugs.length * 2;
console.log(`✅ Sitemap generated: ${totalUrls} URLs (${routes.length} routes, ${slugs.length} blog posts)`);
