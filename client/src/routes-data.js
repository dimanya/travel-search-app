/**
 * Popular routes for SEO landing pages and internal linking.
 * Each entry: { from, to, fromCity_ru, toCity_ru, fromCity_en, toCity_en, tips_ru, tips_en }
 */
export const POPULAR_ROUTES = [
  // US domestic
  { from: 'LAX', to: 'JFK', fromCity_ru: 'Лос-Анджелес', toCity_ru: 'Нью-Йорк', fromCity_en: 'Los Angeles', toCity_en: 'New York',
    tips_ru: ['Лучшие цены за 2-3 месяца до вылета', 'Вторник и среда — самые дешёвые дни', 'Рассмотри рейсы с пересадкой — экономия до 40%'],
    tips_en: ['Best prices 2-3 months before departure', 'Tuesday and Wednesday are cheapest', 'Consider connecting flights — save up to 40%'] },
  { from: 'JFK', to: 'LAX', fromCity_ru: 'Нью-Йорк', toCity_ru: 'Лос-Анджелес', fromCity_en: 'New York', toCity_en: 'Los Angeles',
    tips_ru: ['Ночные рейсы обычно дешевле', 'Проверь Newark (EWR) — часто дешевле JFK'], tips_en: ['Red-eye flights are usually cheaper', 'Check Newark (EWR) — often cheaper than JFK'] },
  { from: 'LAX', to: 'SFO', fromCity_ru: 'Лос-Анджелес', toCity_ru: 'Сан-Франциско', fromCity_en: 'Los Angeles', toCity_en: 'San Francisco',
    tips_ru: ['Короткий перелёт — лоукостеры часто дешевле', 'Рассмотри Oakland (OAK) как альтернативу SFO'], tips_en: ['Short flight — budget airlines often cheaper', 'Consider Oakland (OAK) as alternative to SFO'] },
  { from: 'SFO', to: 'SEA', fromCity_ru: 'Сан-Франциско', toCity_ru: 'Сиэтл', fromCity_en: 'San Francisco', toCity_en: 'Seattle',
    tips_ru: ['Alaska Airlines часто имеет лучшие цены'], tips_en: ['Alaska Airlines often has the best prices'] },
  { from: 'LAX', to: 'MIA', fromCity_ru: 'Лос-Анджелес', toCity_ru: 'Майами', fromCity_en: 'Los Angeles', toCity_en: 'Miami',
    tips_ru: ['Зимой цены выше — бронируй заранее', 'Spirit и Frontier — самые дешёвые опции'], tips_en: ['Prices higher in winter — book early', 'Spirit and Frontier are cheapest options'] },
  { from: 'ORD', to: 'LAX', fromCity_ru: 'Чикаго', toCity_ru: 'Лос-Анджелес', fromCity_en: 'Chicago', toCity_en: 'Los Angeles',
    tips_ru: ['Midway (MDW) может быть дешевле O\'Hare'], tips_en: ['Midway (MDW) can be cheaper than O\'Hare'] },

  // US ↔ Europe
  { from: 'JFK', to: 'LHR', fromCity_ru: 'Нью-Йорк', toCity_ru: 'Лондон', fromCity_en: 'New York', toCity_en: 'London',
    tips_ru: ['Осень — лучшее время для дешёвых билетов', 'Norwegian и PLAY — бюджетные опции'], tips_en: ['Fall is best for cheap tickets', 'Norwegian and PLAY are budget options'] },
  { from: 'LAX', to: 'CDG', fromCity_ru: 'Лос-Анджелес', toCity_ru: 'Париж', fromCity_en: 'Los Angeles', toCity_en: 'Paris',
    tips_ru: ['Прямые рейсы Air France и Delta', 'С пересадкой в Исландии бывает дешевле'], tips_en: ['Direct flights on Air France and Delta', 'Connecting via Iceland can be cheaper'] },

  // Russia / CIS
  { from: 'SVO', to: 'LED', fromCity_ru: 'Москва', toCity_ru: 'Санкт-Петербург', fromCity_en: 'Moscow', toCity_en: 'Saint Petersburg',
    tips_ru: ['Самый популярный маршрут в России', 'Победа и S7 — самые дешёвые'], tips_en: ['Most popular route in Russia', 'Pobeda and S7 are cheapest'] },
  { from: 'SVO', to: 'IST', fromCity_ru: 'Москва', toCity_ru: 'Стамбул', fromCity_en: 'Moscow', toCity_en: 'Istanbul',
    tips_ru: ['Turkish Airlines — лучший сервис', 'Pegasus — бюджетный вариант'], tips_en: ['Turkish Airlines — best service', 'Pegasus — budget option'] },
  { from: 'SVO', to: 'DXB', fromCity_ru: 'Москва', toCity_ru: 'Дубай', fromCity_en: 'Moscow', toCity_en: 'Dubai',
    tips_ru: ['Лето — самые низкие цены (жара)', 'FlyDubai дешевле Emirates'], tips_en: ['Summer has lowest prices (heat)', 'FlyDubai cheaper than Emirates'] },
  { from: 'SVO', to: 'AYT', fromCity_ru: 'Москва', toCity_ru: 'Анталья', fromCity_en: 'Moscow', toCity_en: 'Antalya',
    tips_ru: ['Чартеры часто дешевле регулярных рейсов', 'Бронируй за 1-2 месяца'], tips_en: ['Charters often cheaper than scheduled flights', 'Book 1-2 months ahead'] },

  // Asia
  { from: 'LAX', to: 'NRT', fromCity_ru: 'Лос-Анджелес', toCity_ru: 'Токио', fromCity_en: 'Los Angeles', toCity_en: 'Tokyo',
    tips_ru: ['Зимой (кроме праздников) — самые низкие цены', 'ANA и JAL часто дешевле из LAX'], tips_en: ['Winter (except holidays) has lowest prices', 'ANA and JAL often cheapest from LAX'] },
  { from: 'LAX', to: 'BKK', fromCity_ru: 'Лос-Анджелес', toCity_ru: 'Бангкок', fromCity_en: 'Los Angeles', toCity_en: 'Bangkok',
    tips_ru: ['С пересадкой в Сеуле или Токио — дешевле', 'Сезон дождей (май-октябрь) — низкие цены'], tips_en: ['Connecting via Seoul or Tokyo is cheaper', 'Rainy season (May-Oct) has low prices'] },

  // Latin America
  { from: 'LAX', to: 'CUN', fromCity_ru: 'Лос-Анджелес', toCity_ru: 'Канкун', fromCity_en: 'Los Angeles', toCity_en: 'Cancun',
    tips_ru: ['Прямые рейсы от $200 в несезон', 'Volaris и VivaAerobus — лоукостеры'], tips_en: ['Direct flights from $200 off-season', 'Volaris and VivaAerobus are budget carriers'] },
  { from: 'MIA', to: 'BOG', fromCity_ru: 'Майами', toCity_ru: 'Богота', fromCity_en: 'Miami', toCity_en: 'Bogota',
    tips_ru: ['Spirit Airlines — самые дешёвые билеты', 'Avianca — лучший сервис'], tips_en: ['Spirit Airlines — cheapest tickets', 'Avianca — best service'] },
];

/** Lookup city names and tips for a route */
export function getRouteInfo(from, to, lang = 'ru') {
  const found = POPULAR_ROUTES.find(
    (r) => r.from === from && r.to === to,
  );
  if (found) {
    return {
      fromCity: lang === 'ru' ? found.fromCity_ru : found.fromCity_en,
      toCity: lang === 'ru' ? found.toCity_ru : found.toCity_en,
      tips: lang === 'ru' ? found.tips_ru : found.tips_en,
    };
  }
  // Fallback: use IATA codes
  return { fromCity: from, toCity: to, tips: [] };
}
