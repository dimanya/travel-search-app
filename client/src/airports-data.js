/**
 * airports-data.js — Searchable airport list built from routes-data.js
 * Provides city names in both languages for Autocomplete components
 */

import { POPULAR_ROUTES } from './routes-data';

/**
 * Build unique airports list from POPULAR_ROUTES
 * Each airport: { code, city_en, city_ru }
 */
function buildAirportsList() {
  const airportsMap = new Map();

  POPULAR_ROUTES.forEach((route) => {
    // Add "from" airport
    if (!airportsMap.has(route.from)) {
      airportsMap.set(route.from, {
        code: route.from,
        city_en: route.fromCity_en,
        city_ru: route.fromCity_ru,
      });
    }

    // Add "to" airport
    if (!airportsMap.has(route.to)) {
      airportsMap.set(route.to, {
        code: route.to,
        city_en: route.toCity_en,
        city_ru: route.toCity_ru,
      });
    }
  });

  return Array.from(airportsMap.values()).sort((a, b) =>
    a.city_en.localeCompare(b.city_en)
  );
}

export const AIRPORTS = buildAirportsList();

/**
 * Get display label for airport: "City Name (IATA)"
 * @param {string} code - IATA code
 * @param {string} lang - 'en' or 'ru'
 * @returns {string} Display label
 */
export function getAirportLabel(code, lang = 'en') {
  const airport = AIRPORTS.find((a) => a.code === code);
  if (!airport) return code;

  const cityName = lang === 'ru' ? airport.city_ru : airport.city_en;
  return `${cityName} (${code})`;
}

/**
 * Find airports matching query (city name or IATA code)
 * @param {string} query - Search query
 * @param {string} lang - 'en' or 'ru'
 * @returns {Array} Matching airports
 */
export function findAirports(query, lang = 'en') {
  if (!query) return AIRPORTS;

  const lowerQuery = query.toLowerCase();

  return AIRPORTS.filter((airport) => {
    const cityEn = airport.city_en.toLowerCase();
    const cityRu = airport.city_ru.toLowerCase();
    const code = airport.code.toLowerCase();

    // Match on IATA code or city name in both languages
    return (
      code.includes(lowerQuery) ||
      cityEn.includes(lowerQuery) ||
      cityRu.includes(lowerQuery)
    );
  });
}

/**
 * Get airport object by IATA code
 * @param {string} code - IATA code
 * @returns {Object|null} Airport object or null
 */
export function getAirportByCode(code) {
  return AIRPORTS.find((a) => a.code === code) || null;
}
