import * as React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Chip,
  Stack,
  Box,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useI18n } from '../i18n';
import { POPULAR_ROUTES } from '../routes-data';
import { AIRPORTS } from '../airports-data';

export default function CityHub() {
  const { city: cityCode, lang: urlLang } = useParams();
  const { lang } = useI18n();
  const effectiveLang = (urlLang === 'ru' || urlLang === 'en') ? urlLang : lang;
  const otherLang = effectiveLang === 'ru' ? 'en' : 'ru';
  const code = (cityCode || '').toUpperCase();

  // Find airport info
  const airport = AIRPORTS.find((a) => a.code === code);
  const cityName = airport
    ? (effectiveLang === 'ru' ? airport.city_ru : airport.city_en)
    : code;

  // Get all routes FROM this city
  const routesFrom = POPULAR_ROUTES.filter((r) => r.from === code);
  // Get all routes TO this city
  const routesTo = POPULAR_ROUTES.filter((r) => r.to === code);

  const title = effectiveLang === 'ru'
    ? `Дешёвые авиабилеты из ${cityName} (${code}) — все направления | Travel Search App`
    : `Cheap flights from ${cityName} (${code}) — all destinations | Travel Search App`;

  const description = effectiveLang === 'ru'
    ? `Все дешёвые авиабилеты из ${cityName} (${code}). Сравните цены на ${routesFrom.length}+ направлений. Прямые рейсы и с пересадками.`
    : `All cheap flights from ${cityName} (${code}). Compare prices on ${routesFrom.length}+ destinations. Direct and connecting flights.`;

  const canonicalUrl = `https://travelsearch.now/${effectiveLang}/flights/from/${cityCode}`;
  const alternateUrl = `https://travelsearch.now/${otherLang}/flights/from/${cityCode}`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <html lang={effectiveLang} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang={effectiveLang} href={canonicalUrl} />
        <link rel="alternate" hrefLang={otherLang} href={alternateUrl} />
        <link rel="alternate" hrefLang="x-default" href={`https://travelsearch.now/en/flights/from/${cityCode}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Helmet>

      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
      >
        <Toolbar>
          <FlightTakeoffIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            Travel Search App
          </Typography>
          <Button component={RouterLink} to={`/${effectiveLang}/flights`} startIcon={<ArrowBackIcon />} size="small">
            {effectiveLang === 'ru' ? 'Все направления' : 'All routes'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
          {effectiveLang === 'ru'
            ? `✈️ Авиабилеты из ${cityName} (${code})`
            : `✈️ Flights from ${cityName} (${code})`}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {description}
        </Typography>

        {/* Routes FROM this city */}
        {routesFrom.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              {effectiveLang === 'ru'
                ? `Куда лететь из ${cityName}`
                : `Where to fly from ${cityName}`}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {routesFrom.map((r) => {
                const destName = effectiveLang === 'ru' ? r.toCity_ru : r.toCity_en;
                return (
                  <Chip
                    key={`${r.from}-${r.to}`}
                    label={`${destName} (${r.to})`}
                    component={RouterLink}
                    to={`/${effectiveLang}/flights/${r.from.toLowerCase()}-${r.to.toLowerCase()}`}
                    clickable
                    variant="outlined"
                    icon={<FlightTakeoffIcon />}
                    sx={{ mb: 1 }}
                  />
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Routes TO this city */}
        {routesTo.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              {effectiveLang === 'ru'
                ? `Откуда лететь в ${cityName}`
                : `Flights to ${cityName}`}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {routesTo.map((r) => {
                const origName = effectiveLang === 'ru' ? r.fromCity_ru : r.fromCity_en;
                return (
                  <Chip
                    key={`${r.from}-${r.to}`}
                    label={`${origName} (${r.from})`}
                    component={RouterLink}
                    to={`/${effectiveLang}/flights/${r.from.toLowerCase()}-${r.to.toLowerCase()}`}
                    clickable
                    variant="outlined"
                    icon={<FlightTakeoffIcon />}
                    sx={{ mb: 1 }}
                  />
                );
              })}
            </Stack>
          </Box>
        )}

        {routesFrom.length === 0 && routesTo.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 4 }}>
            {effectiveLang === 'ru'
              ? 'Направления не найдены для этого города.'
              : 'No routes found for this city.'}
          </Typography>
        )}

        {/* SEO text */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          {effectiveLang === 'ru'
            ? `Как найти дешёвые билеты из ${cityName}`
            : `How to find cheap flights from ${cityName}`}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {effectiveLang === 'ru'
            ? `Мы сравниваем цены от десятков авиакомпаний на рейсы из ${cityName} (${code}) через Aviasales. Используйте гибкие даты для лучших цен — сдвиг на 1-2 дня может сэкономить 30-50%. Бронируйте за 2-3 месяца для внутренних рейсов и за 3-5 месяцев для международных.`
            : `We compare prices from dozens of airlines for flights from ${cityName} (${code}) via Aviasales. Use flexible dates for best prices — shifting by 1-2 days can save 30-50%. Book 2-3 months ahead for domestic and 3-5 months for international flights.`}
        </Typography>

        {/* Other city hubs */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          {effectiveLang === 'ru' ? '🌍 Другие города' : '🌍 Other cities'}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {getAllCityHubs(effectiveLang)
            .filter((c) => c.code !== code)
            .slice(0, 20)
            .map((c) => (
              <Chip
                key={c.code}
                label={c.name}
                component={RouterLink}
                to={`/${effectiveLang}/flights/from/${c.code.toLowerCase()}`}
                clickable
                size="small"
                sx={{ mb: 0.5 }}
              />
            ))}
        </Stack>
      </Container>
    </>
  );
}

/** Get unique origin cities that have routes */
function getAllCityHubs(lang) {
  const seen = new Set();
  const hubs = [];
  POPULAR_ROUTES.forEach((r) => {
    if (!seen.has(r.from)) {
      seen.add(r.from);
      hubs.push({
        code: r.from,
        name: lang === 'ru' ? r.fromCity_ru : r.fromCity_en,
      });
    }
  });
  return hubs;
}
