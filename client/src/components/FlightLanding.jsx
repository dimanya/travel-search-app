import * as React from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Box,
  Divider,
  AppBar,
  Toolbar,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TripsTable from './TripsTable';
import { api, trackClick } from '../api';
import { useI18n } from '../i18n';
import { POPULAR_ROUTES, getRouteInfo } from '../routes-data';

export default function FlightLanding() {
  const { route, lang: urlLang } = useParams(); // e.g. "lax-jfk"
  const { t, lang } = useI18n();
  const effectiveLang = (urlLang === 'ru' || urlLang === 'en') ? urlLang : lang;
  const otherLang = effectiveLang === 'ru' ? 'en' : 'ru';
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const parts = (route || '').split('-');
  const from = (parts[0] || '').toUpperCase();
  const to = (parts[1] || '').toUpperCase();
  const info = getRouteInfo(from, to, effectiveLang);

  React.useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    api
      .get('/api/trips', { params: { from, to } })
      .then(({ data }) => setRows(data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [from, to]);

  const title =
    effectiveLang === 'ru'
      ? `Дешёвые авиабилеты ${info.fromCity} → ${info.toCity} | Travel Search App`
      : `Cheap flights ${info.fromCity} → ${info.toCity} | Travel Search App`;

  const description =
    effectiveLang === 'ru'
      ? `Ищи дешёвые авиабилеты из ${info.fromCity} (${from}) в ${info.toCity} (${to}). Сравни цены, найди прямые рейсы и бронируй через Aviasales.`
      : `Find cheap flights from ${info.fromCity} (${from}) to ${info.toCity} (${to}). Compare prices, find direct flights and book via Aviasales.`;

  const canonicalUrl = `https://travelsearch.now/${effectiveLang}/flights/${route}`;
  const alternateUrl = `https://travelsearch.now/${otherLang}/flights/${route}`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <html lang={effectiveLang} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang={effectiveLang} href={canonicalUrl} />
        <link rel="alternate" hrefLang={otherLang} href={alternateUrl} />
        <link rel="alternate" hrefLang="x-default" href={`https://travelsearch.now/en/flights/${route}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={effectiveLang === 'ru' ? 'ru_RU' : 'en_US'} />
      </Helmet>

      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{
          borderBottom: '1px solid #e0e0e0',
          bgcolor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar>
          <FlightTakeoffIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Travel Search App
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackIcon />}
            size="small"
          >
            {effectiveLang === 'ru' ? 'Главная' : 'Home'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Hero SEO block */}
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
          {effectiveLang === 'ru'
            ? `Авиабилеты ${info.fromCity} → ${info.toCity}`
            : `Flights ${info.fromCity} → ${info.toCity}`}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>

        {/* Results */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            {loading ? (
              <Stack alignItems="center" sx={{ py: 4 }}>
                <CircularProgress />
              </Stack>
            ) : rows.length > 0 ? (
              <TripsTable rows={rows} />
            ) : (
              <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                {effectiveLang === 'ru'
                  ? 'Рейсы не найдены. Попробуйте изменить даты на главной странице.'
                  : 'No flights found. Try different dates on the main page.'}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* SEO content block */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            {effectiveLang === 'ru'
              ? `Как найти дешёвые билеты ${info.fromCity} — ${info.toCity}`
              : `How to find cheap flights ${info.fromCity} — ${info.toCity}`}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {effectiveLang === 'ru'
              ? `Маршрут ${info.fromCity} (${from}) — ${info.toCity} (${to}) — один из популярных направлений. Мы сравниваем цены от десятков авиакомпаний через Aviasales, чтобы вы могли найти самый выгодный вариант. Используйте гибкие даты для лучших цен и бронируйте заранее.`
              : `The ${info.fromCity} (${from}) to ${info.toCity} (${to}) route is one of the popular destinations. We compare prices from dozens of airlines via Aviasales so you can find the best deal. Use flexible dates for better prices and book in advance.`}
          </Typography>

          {info.tips && info.tips.length > 0 && (
            <>
              <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 1 }}>
                {effectiveLang === 'ru' ? '💡 Советы' : '💡 Tips'}
              </Typography>
              <ul>
                {info.tips.map((tip, i) => (
                  <li key={i}>
                    <Typography variant="body2">{tip}</Typography>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Box>

        {/* Internal links to related routes */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          {effectiveLang === 'ru' ? '🔗 Популярные направления' : '🔗 Popular routes'}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {POPULAR_ROUTES.filter((r) => r.from !== from || r.to !== to)
            .slice(0, 12)
            .map((r) => (
              <Chip
                key={`${r.from}-${r.to}`}
                label={`${r.from} → ${r.to}`}
                component={RouterLink}
                to={`/${effectiveLang}/flights/${r.from.toLowerCase()}-${r.to.toLowerCase()}`}
                clickable
                variant="outlined"
                sx={{ mb: 1 }}
              />
            ))}
        </Stack>
      </Container>
    </>
  );
}
