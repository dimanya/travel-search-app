import * as React from 'react';

const translations = {
  ru: {
    appTitle: 'Travel Search App',
    heroTitle: 'Найди идеальную поездку',
    heroSub: 'На вкладке Search — поиск реальных рейсов. На вкладке AI Planner — умный маршрут и примерная смета.',
    tabSearch: 'Search',
    tabPlanner: 'AI Planner',
    betaAlert: 'Travel Search App — beta версия. Маршруты и цены примерные, проверяйте детали перед бронированием.',
    searchTitle: 'Поиск рейсов',
    searchSub: 'Введи аэропорты (IATA-коды: LAX, JFK, SVO...) и дату вылета',
    fromLabel: 'Откуда (IATA)',
    toLabel: 'Куда (IATA)',
    dateLabel: 'Дата вылета',
    searchBtn: 'Поиск',
    addBtn: 'Добавить',
    plannerTitle: 'AI Travel Planner',
    plannerSub: 'Сгенерируй маршрут и примерную смету с помощью AI',
    originLabel: 'Город отправления',
    daysLabel: 'Дней',
    budgetLabel: 'Бюджет (low/medium/high)',
    interestsLabel: 'Интересы',
    departureDateLabel: 'Дата вылета',
    generateBtn: 'Генерировать',
    generatingBtn: 'Генерируем...',
    estimatedTotal: 'Примерная сумма',
    copyRoute: 'Скопировать маршрут',
    shareRoute: 'Поделиться маршрутом',
    copiedMsg: 'Маршрут скопирован в буфер обмена',
    linkCopied: 'Ссылка скопирована!',
    tips: 'Советы',
    day: 'День',
    buy: 'Купить',
    tickets: 'Билеты',
    hotels: 'Отели',
    direct: 'Прямой',
    transfers: 'пер.',
    noResults: 'Нет результатов. Попробуй изменить фильтры.',
    from: 'From',
    to: 'To',
    date: 'Date',
    airline: 'Airline',
    transfersCol: 'Transfers',
    price: 'Price',
    demo: 'Demo',
    addTripTitle: 'Добавить поездку',
    cancel: 'Отмена',
    save: 'Сохранить',
    errorGenerate: 'Не удалось сгенерировать маршрут. Повторите позже.',
    errorCopy: 'Не удалось скопировать маршрут в буфер обмена.',
  },
  en: {
    appTitle: 'Travel Search App',
    heroTitle: 'Find your perfect trip',
    heroSub: 'Search tab — real flight search. AI Planner tab — smart itinerary and budget estimate.',
    tabSearch: 'Search',
    tabPlanner: 'AI Planner',
    betaAlert: 'Travel Search App — beta. Routes and prices are approximate, verify details before booking.',
    searchTitle: 'Flight Search',
    searchSub: 'Enter airports (IATA codes: LAX, JFK, SVO...) and departure date',
    fromLabel: 'From (IATA)',
    toLabel: 'To (IATA)',
    dateLabel: 'Departure date',
    searchBtn: 'Search',
    addBtn: 'Add',
    plannerTitle: 'AI Travel Planner',
    plannerSub: 'Generate an itinerary and budget estimate with AI',
    originLabel: 'Departure city',
    daysLabel: 'Days',
    budgetLabel: 'Budget (low/medium/high)',
    interestsLabel: 'Interests',
    departureDateLabel: 'Departure date',
    generateBtn: 'Generate',
    generatingBtn: 'Generating...',
    estimatedTotal: 'Estimated total',
    copyRoute: 'Copy itinerary',
    shareRoute: 'Share itinerary',
    copiedMsg: 'Itinerary copied to clipboard',
    linkCopied: 'Link copied!',
    tips: 'Tips',
    day: 'Day',
    buy: 'Buy',
    tickets: 'Tickets',
    hotels: 'Hotels',
    direct: 'Direct',
    transfers: 'stop(s)',
    noResults: 'No results. Try changing filters.',
    from: 'From',
    to: 'To',
    date: 'Date',
    airline: 'Airline',
    transfersCol: 'Transfers',
    price: 'Price',
    demo: 'Demo',
    addTripTitle: 'Add trip',
    cancel: 'Cancel',
    save: 'Save',
    errorGenerate: 'Failed to generate itinerary. Please try again later.',
    errorCopy: 'Failed to copy itinerary to clipboard.',
  },
};

const I18nContext = React.createContext({ t: translations.ru, lang: 'ru', setLang: () => {} });

export function I18nProvider({ children }) {
  const [lang, setLang] = React.useState(() => {
    const saved = localStorage.getItem('lang');
    if (saved && translations[saved]) return saved;
    const browser = navigator.language?.slice(0, 2);
    return browser === 'ru' ? 'ru' : 'en';
  });

  const setLangAndSave = (l) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  const value = React.useMemo(
    () => ({ t: translations[lang], lang, setLang: setLangAndSave }),
    [lang],
  );

  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  return React.useContext(I18nContext);
}
