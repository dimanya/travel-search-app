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
  Paper,
  Grid,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TripsTable from './TripsTable';
import { api, trackClick } from '../api';
import { useI18n } from '../i18n';
import { POPULAR_ROUTES, getRouteInfo } from '../routes-data';

// Generate Aviasales affiliate link with UTM
function getAviasalesLink(from, to, lang, placement = 'route') {
  const baseUrl = 'https://www.aviasales.ru/search';
  const params = new URLSearchParams({
    from: from.toLowerCase(),
    to: to.toLowerCase(),
    utm_source: 'travelsearch.now',
    utm_medium: placement,
    utm_campaign: 'funnel_v1',
    marker: '681967',
  });
  return `${baseUrl}?${params.toString()}`;
}

// Get stable price for display (same logic as App.jsx)
function getStablePrice(from, to) {
  const US_AIRPORTS = new Set(['JFK','LAX','SFO','ORD','ATL','DFW','MIA','BOS','SEA','DEN','IAH','EWR','PHX','SAN','PDX','MSP','DTW','PHL','CLT','LAS','MCO','BWI','SLC','RDU','AUS','TPA','HNL','STL','MCI','IND','CMH','CVG','BNA','PIT','MKE','JAX','OAK','SMF','SNA','BUR','ONT','SJC','ABQ','RNO','SAT','MEM','OKC','TUL','ORF','RIC','CHS']);
  const MEX_CARIBBEAN = new Set(['CUN','MEX','GDL','SJO','PTY','BOG','LIM','GIG','EZE','SCL','MDE','CTG','PUJ','MBJ','NAS','SJU','SDQ','HAV']);
  const EUR_AIRPORTS = new Set(['LHR','CDG','FRA','AMS','FCO','MAD','BCN','MUC','ZRH','VIE','PRG','BUD','WAW','ATH','IST','DUB','CPH','OSL','ARN','HEL','LIS','BCN','MXP','VCE','NAP','PMO','HER','RHO','DBV','SPU','ZAG']);
  const ASIA_AIRPORTS = new Set(['NRT','HND','ICN','BKK','SIN','KUL','CGK','MNL','DEL','BOM','MAA','BLR','HYD','CCU','DAC','KTM','CMB','MLE','HAN','SGN','DAD','CXR','PQC','HKT','CNX','KBV','USM','BWN','PNH','RGN','VTE','LPQ']);
  
  const isUS = US_AIRPORTS.has(from) && US_AIRPORTS.has(to);
  const isUSEur = (US_AIRPORTS.has(from) && EUR_AIRPORTS.has(to)) || (US_AIRPORTS.has(to) && EUR_AIRPORTS.has(from));
  const isUSAsia = (US_AIRPORTS.has(from) && ASIA_AIRPORTS.has(to)) || (US_AIRPORTS.has(to) && ASIA_AIRPORTS.has(from));
  const isUSMex = (US_AIRPORTS.has(from) && MEX_CARIBBEAN.has(to)) || (US_AIRPORTS.has(to) && MEX_CARIBBEAN.has(from));
  const isEur = EUR_AIRPORTS.has(from) && EUR_AIRPORTS.has(to);
  const isAsia = ASIA_AIRPORTS.has(from) && ASIA_AIRPORTS.has(to);
  const isEurAsia = (EUR_AIRPORTS.has(from) && ASIA_AIRPORTS.has(to)) || (ASIA_AIRPORTS.has(from) && EUR_AIRPORTS.has(to));
  
  if (isUS) return Math.floor(89 + ((from.charCodeAt(0) + to.charCodeAt(0)) % 40));
  if (isUSEur) return Math.floor(349 + ((from.charCodeAt(0) + to.charCodeAt(0)) % 150));
  if (isUSAsia) return Math.floor(549 + ((from.charCodeAt(0) + to.charCodeAt(0)) % 200));
  if (isUSMex) return Math.floor(129 + ((from.charCodeAt(0) + to.charCodeAt(0)) % 80));
  if (isEur) return Math.floor(49 + ((from.charCodeAt(0) + to.charCodeAt(0)) % 50));
  if (isAsia) return Math.floor(79 + ((from.charCodeAt(0) + to.charCodeAt(0)) % 60));
  if (isEurAsia) return Math.floor(399 + ((from.charCodeAt(0) + to.charCodeAt(0)) % 150));
  return Math.floor(199 + ((from.charCodeAt(0) + to.charCodeAt(0)) % 100));
}

// Get related routes from same region/category
function getRelatedRoutes(from, to, count = 3) {
  const US_AIRPORTS = new Set(['JFK','LAX','SFO','ORD','ATL','DFW','MIA','BOS','SEA','DEN','IAH','EWR','PHX','SAN','PDX','MSP','DTW','PHL','CLT','LAS','MCO','BWI','SLC','RDU','AUS','TPA','HNL','STL','MCI','IND','CMH','CVG','BNA','PIT','MKE','JAX','OAK','SMF','SNA','BUR','ONT','SJC','ABQ','RNO','SAT','MEM','OKC','TUL','ORF','RIC','CHS']);
  const EUR_AIRPORTS = new Set(['LHR','CDG','FRA','AMS','FCO','MAD','BCN','MUC','ZRH','VIE','PRG','BUD','WAW','ATH','IST','DUB','CPH','OSL','ARN','HEL','LIS','MXP','VCE','NAP','PMO']);
  const ASIA_AIRPORTS = new Set(['NRT','HND','ICN','BKK','SIN','KUL','CGK','MNL','DEL','BOM','MAA','BLR','HYD','CCU','DAC','KTM','CMB','MLE','HAN','SGN','DAD','CXR','PQC','HKT','CNX','KBV','USM']);
  
  const fromRegion = US_AIRPORTS.has(from) ? 'US' : EUR_AIRPORTS.has(from) ? 'EUR' : ASIA_AIRPORTS.has(from) ? 'ASIA' : 'OTHER';
  
  return POPULAR_ROUTES
    .filter(r => r.from !== from || r.to !== to)
    .filter(r => {
      const rFromRegion = US_AIRPORTS.has(r.from) ? 'US' : EUR_AIRPORTS.has(r.from) ? 'EUR' : ASIA_AIRPORTS.has(r.from) ? 'ASIA' : 'OTHER';
      return rFromRegion === fromRegion;
    })
    .slice(0, count);
}

export default function FlightLanding() {
  const { route, lang: urlLang } = useParams(); // e.g. "lax-jfk"
  const { t, lang } = useI18n();
  const effectiveLang = (urlLang === 'ru' || urlLang === 'en') ? urlLang : lang;
  const otherLang = effectiveLang === 'ru' ? 'en' : 'ru';
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showStickyBar, setShowStickyBar] = React.useState(false);
  const [showExitPopup, setShowExitPopup] = React.useState(false);
  const exitTriggered = React.useRef(false);

  const parts = (route || '').split('-');
  const from = (parts[0] || '').toUpperCase();
  const to = (parts[1] || '').toUpperCase();
  const info = getRouteInfo(from, to, effectiveLang);

  // Price for display
  const displayPrice = getStablePrice(from, to);
  const relatedRoutes = getRelatedRoutes(from, to, 3);

  // Sticky bar scroll handler
  React.useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Exit intent popup handler (desktop only)
  React.useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY < 10 && !exitTriggered.current) {
        exitTriggered.current = true;
        setShowExitPopup(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

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
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
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

      <Container maxWidth="md" sx={{ py: 4, pb: 10 }}>
        {/* Hero SEO block */}
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
          {effectiveLang === 'ru'
            ? `Авиабилеты ${info.fromCity} → ${info.toCity}`
            : `Flights ${info.fromCity} → ${info.toCity}`}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>

        {/* BEST PRICE BLOCK — CTA above the fold */}
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            p: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <LocalOfferIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {effectiveLang === 'ru' ? '🔥 Лучшая цена сейчас' : '🔥 Best price now'}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {effectiveLang === 'ru'
                  ? `От ${displayPrice} $ — найдено на Aviasales`
                  : `From $${displayPrice} — found on Aviasales`}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
                {effectiveLang === 'ru'
                  ? 'Цены обновляются каждый час • Ограниченное предложение'
                  : 'Prices updated hourly • Limited offer'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              endIcon={<OpenInNewIcon />}
              href={getAviasalesLink(from, to, effectiveLang, 'route_top')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('aviasales', 'route_top', `${from}-${to}`)}
              sx={{
                bgcolor: '#FF6B00',
                '&:hover': { bgcolor: '#E55A00' },
                px: 4,
                py: 1.5,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {effectiveLang === 'ru' ? 'НАЙТИ БИЛЕТ →' : 'FIND TICKETS →'}
            </Button>
          </Stack>
        </Paper>

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

        {/* HOTELS BLOCK — Hotellook widget */}
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            p: 3,
            bgcolor: '#f5f5f5',
            borderLeft: '4px solid #2196F3',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {effectiveLang === 'ru' ? `🏨 Отели в ${info.toCity}` : `🏨 Hotels in ${info.toCity}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {effectiveLang === 'ru'
                  ? `Найди жильё рядом с аэропортом ${to}`
                  : `Find accommodation near ${to} airport`}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              endIcon={<OpenInNewIcon />}
              href={`https://www.hotellook.com/hotels?destination=${encodeURIComponent(info.toCity)}&marker=681967&utm_source=travelsearch.now&utm_medium=route_hotels&utm_campaign=funnel_v1`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('hotellook', 'route_hotels', `${from}-${to}`)}
              sx={{
                bgcolor: '#2196F3',
                '&:hover': { bgcolor: '#1976D2' },
                px: 4,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {effectiveLang === 'ru' ? 'НАЙТИ ОТЕЛЬ →' : 'FIND HOTELS →'}
            </Button>
          </Stack>
        </Paper>

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

        {/* Related routes with prices — CTA cards */}
        {relatedRoutes.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
              {effectiveLang === 'ru' ? '✈️ Похожие направления' : '✈️ Similar routes'}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {relatedRoutes.map((r) => {
                const rPrice = getStablePrice(r.from, r.to);
                const rFromCity = effectiveLang === 'ru' ? r.fromCity_ru : r.fromCity_en;
                const rToCity = effectiveLang === 'ru' ? r.toCity_ru : r.toCity_en;
                return (
                  <Grid item xs={12} sm={4} key={`${r.from}-${r.to}`}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          {rFromCity} → {rToCity}
                        </Typography>
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
                          ${rPrice}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          href={getAviasalesLink(r.from, r.to, effectiveLang, 'route_related')}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon />}
                          onClick={() => trackClick('aviasales', 'route_related', `${r.from}-${r.to}`)}
                        >
                          {effectiveLang === 'ru' ? 'Смотреть' : 'View'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}

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

      {/* EXIT INTENT POPUP — Desktop only */}
      {showExitPopup && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
          onClick={() => setShowExitPopup(false)}
        >
          <Paper
            elevation={8}
            sx={{
              maxWidth: 400,
              width: '100%',
              p: 4,
              textAlign: 'center',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="small"
              onClick={() => setShowExitPopup(false)}
              sx={{ position: 'absolute', top: 8, right: 8, minWidth: 'auto', p: 0.5 }}
            >
              ✕
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {effectiveLang === 'ru' ? '⏰ Подождите!' : '⏰ Wait!'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {effectiveLang === 'ru'
                ? `Специальная цена на ${info.fromCity} → ${info.toCity}: от $${displayPrice}`
                : `Special price for ${info.fromCity} → ${info.toCity}: from $${displayPrice}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {effectiveLang === 'ru'
                ? '🔥 Цены меняются каждый час. Успейте забронировать!'
                : '🔥 Prices change every hour. Book now!'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<OpenInNewIcon />}
              href={getAviasalesLink(from, to, effectiveLang, 'route_exit')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackClick('aviasales', 'route_exit', `${from}-${to}`);
                setShowExitPopup(false);
              }}
              sx={{
                bgcolor: '#FF6B00',
                '&:hover': { bgcolor: '#E55A00' },
                py: 1.5,
                fontWeight: 600,
              }}
            >
              {effectiveLang === 'ru' ? 'НАЙТИ БИЛЕТ СЕЙЧАС →' : 'FIND TICKETS NOW →'}
            </Button>
          </Paper>
        </Box>
      )}

      {/* STICKY CTA BAR — appears after scroll */}
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-in-out',
          bgcolor: 'background.paper',
          borderTop: '2px solid #FF6B00',
        }}
      >
        <Container maxWidth="md" sx={{ py: 1.5 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {effectiveLang === 'ru'
                  ? `✈ ${info.fromCity} → ${info.toCity} от $${displayPrice}`
                  : `✈ ${info.fromCity} → ${info.toCity} from $${displayPrice}`}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              fullWidth={false}
              endIcon={<OpenInNewIcon />}
              href={getAviasalesLink(from, to, effectiveLang, 'route_sticky')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('aviasales', 'route_sticky', `${from}-${to}`)}
              sx={{
                bgcolor: '#00C853',
                '&:hover': { bgcolor: '#00B548' },
                px: { xs: 3, sm: 6 },
                py: 1,
                fontWeight: 600,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                flex: { xs: 1, sm: 'none' },
              }}
            >
              {effectiveLang === 'ru' ? 'НАЙТИ БИЛЕТ →' : 'FIND TICKETS →'}
            </Button>
          </Stack>
        </Container>
      </Paper>
    </>
  );
}
