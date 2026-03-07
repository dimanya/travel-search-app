import * as React from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Box,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useI18n } from '../i18n';
import { POPULAR_ROUTES } from '../routes-data';

export default function RoutesIndex() {
  const { lang: urlLang } = useParams();
  const { lang } = useI18n();
  const effectiveLang = (urlLang === 'ru' || urlLang === 'en') ? urlLang : lang;
  const otherLang = effectiveLang === 'ru' ? 'en' : 'ru';

  const title = effectiveLang === 'ru'
    ? 'Популярные авианаправления — дешёвые билеты | Travel Search App'
    : 'Popular flight routes — cheap tickets | Travel Search App';

  const description = effectiveLang === 'ru'
    ? 'Сравни цены на авиабилеты по популярным направлениям. Прямые рейсы и с пересадками от Aviasales.'
    : 'Compare flight prices on popular routes. Direct and connecting flights via Aviasales.';

  // Group by origin
  const grouped = {};
  POPULAR_ROUTES.forEach((r) => {
    const city = effectiveLang === 'ru' ? r.fromCity_ru : r.fromCity_en;
    if (!grouped[city]) grouped[city] = [];
    grouped[city].push(r);
  });

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <html lang={effectiveLang} />
        <link rel="canonical" href={`https://travelsearch.now/${effectiveLang}/flights`} />
        <link rel="alternate" hrefLang={effectiveLang} href={`https://travelsearch.now/${effectiveLang}/flights`} />
        <link rel="alternate" hrefLang={otherLang} href={`https://travelsearch.now/${otherLang}/flights`} />
        <link rel="alternate" hrefLang="x-default" href="https://travelsearch.now/en/flights" />
      </Helmet>

      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
      >
        <Toolbar>
          <FlightTakeoffIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>Travel Search App</Typography>
          <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} size="small">
            {effectiveLang === 'ru' ? 'Главная' : 'Home'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
          {effectiveLang === 'ru' ? '✈️ Популярные авианаправления' : '✈️ Popular Flight Routes'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {description}
        </Typography>

        {Object.entries(grouped).map(([city, routes]) => (
          <Box key={city} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {effectiveLang === 'ru' ? `Из ${city}` : `From ${city}`}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {routes.map((r) => (
                <Chip
                  key={`${r.from}-${r.to}`}
                  label={`${r.from} → ${r.to} ${effectiveLang === 'ru' ? r.toCity_ru : r.toCity_en}`}
                  component={RouterLink}
                  to={`/${effectiveLang}/flights/${r.from.toLowerCase()}-${r.to.toLowerCase()}`}
                  clickable
                  variant="outlined"
                  icon={<FlightTakeoffIcon />}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        ))}
      </Container>
    </>
  );
}
