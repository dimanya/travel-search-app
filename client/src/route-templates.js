/**
 * Route Templates — Predefined travel styles for AI planner
 * Each template defines: style, interests, budget profile, pace, and activity preferences
 */

export const ROUTE_TEMPLATES = {
  romantic: {
    id: 'romantic',
    key: 'romantic',
    icon: '💕',
    name_ru: 'Романтический',
    name_en: 'Romantic',
    description_ru: 'Идеально для пар: ужины при свечах, закаты, спа и уютные отели',
    description_en: 'Perfect for couples: candlelit dinners, sunsets, spas, and cozy hotels',
    defaultInterests_ru: 'романтические ужины, закаты, спа, прогулки по набережным, винные дегустации, уютные кафе',
    defaultInterests_en: 'romantic dinners, sunsets, spa, waterfront walks, wine tasting, cozy cafes',
    budget: 'high',
    pace: 'relaxed',
    accommodation: 'boutique_hotel',
    activityTypes: ['dining', 'relaxation', 'scenic', 'culture'],
    preferredTimes: ['evening', 'sunset'],
    avoid: ['crowds', 'nightlife', 'adventure_sports'],
  },
  
  family: {
    id: 'family',
    key: 'family',
    icon: '👨‍👩‍👧‍👦',
    name_ru: 'Семейный',
    name_en: 'Family',
    description_ru: 'Развлечения для всех возрастов: парки, музеи, зоопарки, пляжи с инфраструктурой',
    description_en: 'Fun for all ages: parks, museums, zoos, beaches with facilities',
    defaultInterests_ru: 'парки развлечений, зоопарки, детские музеи, пляжи с спасателями, аквариумы, фермы',
    defaultInterests_en: 'amusement parks, zoos, children museums, lifeguard beaches, aquariums, farms',
    budget: 'medium',
    pace: 'moderate',
    accommodation: 'family_friendly',
    activityTypes: ['entertainment', 'education', 'outdoor', 'dining'],
    preferredTimes: ['morning', 'afternoon'],
    avoid: ['nightlife', 'fine_dining', 'dangerous_activities'],
    kidFriendly: true,
  },
  
  backpacking: {
    id: 'backpacking',
    key: 'backpacking',
    icon: '🎒',
    name_ru: 'Бэкпекинг',
    name_en: 'Backpacking',
    description_ru: 'Бюджетное путешествие: хостелы, местная еда, пешие прогулки, общественный транспорт',
    description_en: 'Budget travel: hostels, street food, hiking, public transport',
    defaultInterests_ru: 'хостелы, уличная еда, пешие маршруты, достопримечательности, местные рынки, бесплатные музеи',
    defaultInterests_en: 'hostels, street food, hiking trails, sightseeing, local markets, free museums',
    budget: 'low',
    pace: 'active',
    accommodation: 'hostel',
    activityTypes: ['adventure', 'culture', 'outdoor', 'social'],
    preferredTimes: ['early_morning', 'daytime'],
    avoid: ['luxury', 'fine_dining', 'taxis', 'guided_tours'],
  },
  
  luxury: {
    id: 'luxury',
    key: 'luxury',
    icon: '✨',
    name_ru: 'Люкс',
    name_en: 'Luxury',
    description_ru: 'Премиум-отдых: 5-звёздочные отели, мишленовские рестораны, частные трансферы',
    description_en: 'Premium vacation: 5-star hotels, Michelin restaurants, private transfers',
    defaultInterests_ru: 'люкс отели, мишлен рестораны, спа, шопинг, приватные туры, вертолётные экскурсии',
    defaultInterests_en: 'luxury hotels, Michelin dining, spa, shopping, private tours, helicopter tours',
    budget: 'luxury',
    pace: 'relaxed',
    accommodation: 'luxury_hotel',
    activityTypes: ['luxury', 'dining', 'relaxation', 'shopping'],
    preferredTimes: ['anytime'],
    avoid: ['crowds', 'public_transport', 'budget_options'],
  },
  
  adventure: {
    id: 'adventure',
    key: 'adventure',
    icon: '🏔️',
    name_ru: 'Приключения',
    name_en: 'Adventure',
    description_ru: 'Активный отдых: треккинг, серфинг, дайвинг, экстрим',
    description_en: 'Active vacation: trekking, surfing, diving, extreme sports',
    defaultInterests_ru: 'треккинг, серфинг, дайвинг, скалолазание, рафтинг, кемпинг, велотуры',
    defaultInterests_en: 'trekking, surfing, diving, rock climbing, rafting, camping, cycling',
    budget: 'medium',
    pace: 'active',
    accommodation: 'mixed',
    activityTypes: ['adventure', 'outdoor', 'sports'],
    preferredTimes: ['early_morning', 'daytime'],
    avoid: ['luxury', 'relaxation', 'city_tours'],
  },
  
  cultural: {
    id: 'cultural',
    key: 'cultural',
    icon: '🏛️',
    name_ru: 'Культурный',
    name_en: 'Cultural',
    description_ru: 'Погружение в историю и культуру: музеи, храмы, театры, кулинарные туры',
    description_en: 'Immerse in history and culture: museums, temples, theaters, food tours',
    defaultInterests_ru: 'музеи, исторические места, храмы, театры, кулинарные туры, архитектура',
    defaultInterests_en: 'museums, historic sites, temples, theaters, food tours, architecture',
    budget: 'medium',
    pace: 'moderate',
    accommodation: 'boutique_hotel',
    activityTypes: ['culture', 'education', 'dining'],
    preferredTimes: ['morning', 'afternoon'],
    avoid: ['nightlife', 'adventure_sports'],
  },
  
  foodie: {
    id: 'foodie',
    key: 'foodie',
    icon: '🍜',
    name_ru: 'Гастрономический',
    name_en: 'Foodie',
    description_ru: 'Путешествие за вкусом: рестораны, рынки, кулинарные мастер-классы',
    description_en: 'Journey for taste: restaurants, markets, cooking classes',
    defaultInterests_ru: 'рестораны, рынки, кулинарные классы, винодельни, уличная еда, фуд-туры',
    defaultInterests_en: 'restaurants, markets, cooking classes, wineries, street food, food tours',
    budget: 'high',
    pace: 'relaxed',
    accommodation: 'boutique_hotel',
    activityTypes: ['dining', 'culture'],
    preferredTimes: ['anytime'],
    avoid: ['fast_food', 'adventure_sports'],
  },
  
  solo: {
    id: 'solo',
    key: 'solo',
    icon: '🧳',
    name_ru: 'Соло-путешествие',
    name_en: 'Solo Travel',
    description_ru: 'Безопасные маршруты для одиночек: хостелы, коворкинги, групповые туры',
    description_en: 'Safe routes for solo travelers: hostels, coworking, group tours',
    defaultInterests_ru: 'хостелы, коворкинги, групповые туры, пешеходные экскурсии, кафе, митапы',
    defaultInterests_en: 'hostels, coworking, group tours, walking tours, cafes, meetups',
    budget: 'medium',
    pace: 'moderate',
    accommodation: 'hostel',
    activityTypes: ['social', 'culture', 'relaxation'],
    preferredTimes: ['anytime'],
    avoid: ['dangerous_areas', 'remote_locations'],
    soloFriendly: true,
  },
};

/**
 * Get template by key
 * @param {string} key - Template key
 * @returns {Object|null} Template object or null
 */
export function getTemplate(key) {
  return ROUTE_TEMPLATES[key] || null;
}

/**
 * Get all templates as array
 * @returns {Array} Array of template objects
 */
export function getAllTemplates() {
  return Object.values(ROUTE_TEMPLATES);
}

/**
 * Get template names for UI
 * @param {string} lang - 'en' or 'ru'
 * @returns {Array} Array of {key, name, icon, description}
 */
export function getTemplateOptions(lang = 'en') {
  return Object.values(ROUTE_TEMPLATES).map(t => ({
    key: t.key,
    icon: t.icon,
    name: lang === 'ru' ? t.name_ru : t.name_en,
    description: lang === 'ru' ? t.description_ru : t.description_en,
  }));
}

/**
 * Build AI prompt based on template
 * @param {string} templateKey - Template key
 * @param {Object} params - Additional parameters
 * @returns {Object} Prompt configuration
 */
export function buildTemplatePrompt(templateKey, params = {}) {
  const template = getTemplate(templateKey);
  if (!template) return null;
  
  const { lang = 'en', origin, days } = params;
  
  return {
    style: template.key,
    interests: lang === 'ru' ? template.defaultInterests_ru : template.defaultInterests_en,
    budget: template.budget,
    pace: template.pace,
    accommodation: template.accommodation,
    activityTypes: template.activityTypes,
    preferredTimes: template.preferredTimes,
    avoid: template.avoid,
    kidFriendly: template.kidFriendly || false,
    soloFriendly: template.soloFriendly || false,
  };
}

export default ROUTE_TEMPLATES;
