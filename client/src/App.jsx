import * as React from 'react';
import {
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Box,
  AppBar,
  Toolbar,
  Chip,
  Card,
  CardHeader,
  CardContent,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Autocomplete,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';

import TripsTable from './components/TripsTable';
import AddTripDialog from './components/AddTripDialog';
import Planner from './components/Planner';
import Hotels from './components/Hotels';
import SubscribeBlock from './components/SubscribeBlock';
import { api } from './api';
import { useI18n } from './i18n';
import { POPULAR_ROUTES } from './routes-data';
import { AIRPORTS, getAirportLabel } from './airports-data';

// Approximate starting prices by route type for display
const US_AIRPORTS = new Set(['JFK','LAX','SFO','ORD','ATL','DFW','MIA','BOS','SEA','DEN','IAH','EWR','PHX','SAN','PDX','MSP','DTW','PHL','CLT','LAS','MCO','BWI','SLC','RDU','AUS','TPA','HNL','STL','MCI','IND','CMH','CVG','BNA','PIT','MKE','JAX','OAK','SMF','SNA','BUR','ONT','SJC','ABQ','RNO','SAT','MEM','OKC','TUL','ORF','RIC','CHS']);
const MEX_CARIBBEAN = new Set(['CUN','MEX','GDL','SJO','PTY','BOG','LIM','GIG','EZE','SCL','MDE','CTG','PUJ','MBJ','NAS','SJU','SDQ','HAV']);
const EUR_AIRPORTS = new Set(['LHR','CDG','FRA','AMS','FCO','BCN','MAD','MUC','ZRH','VIE','CPH','ARN','DUB','LIS','ATH','IST','PRG','BUD','WAW','BER','BRU','HEL','OSL','KEF','TBS','EVN']);
const ASIA_AIRPORTS = new Set(['NRT','HND','BKK','SIN','HKG','ICN','DEL','BOM','CGK','MNL','TPE','HAN','KUL','PEK','PVG','DXB','DOH','JED','AYT','TLV','CAI','ALA','BAK','GYD','TAS','LED','SVO','AER','DME']);

function getRoutePrice(from, to) {
  const isUS_f = US_AIRPORTS.has(from), isUS_t = US_AIRPORTS.has(to);
  const isMex_f = MEX_CARIBBEAN.has(from), isMex_t = MEX_CARIBBEAN.has(to);
  const isEur_f = EUR_AIRPORTS.has(from), isEur_t = EUR_AIRPORTS.has(to);
  const isAsia_f = ASIA_AIRPORTS.has(from), isAsia_t = ASIA_AIRPORTS.has(to);

  // US domestic
  if (isUS_f && isUS_t) {
    const short = new Set([['LAX','SFO'],['LAX','LAS'],['LAX','PHX'],['SFO','SEA'],['SFO','SAN'],['BOS','JFK']].map(p=>p.join('-')));
    const key = [from,to].sort().join('-');
    if (short.has(key)) return Math.floor(29 + Math.random() * 40);
    return Math.floor(79 + Math.random() * 80);
  }
  // US <-> Mexico/Caribbean
  if ((isUS_f && isMex_t) || (isMex_f && isUS_t)) return Math.floor(149 + Math.random() * 120);
  // US <-> Europe
  if ((isUS_f && isEur_t) || (isEur_f && isUS_t)) return Math.floor(299 + Math.random() * 200);
  // US <-> Asia
  if ((isUS_f && isAsia_t) || (isAsia_f && isUS_t)) return Math.floor(399 + Math.random() * 250);
  // Intra-Europe
  if (isEur_f && isEur_t) return Math.floor(39 + Math.random() * 80);
  // Europe <-> Asia/ME
  if ((isEur_f && isAsia_t) || (isAsia_f && isEur_t)) return Math.floor(199 + Math.random() * 150);
  // Intra-Asia
  if (isAsia_f && isAsia_t) return Math.floor(99 + Math.random() * 150);
  // Russia domestic
  if (['SVO','LED','AER','DME'].includes(from) && ['SVO','LED','AER','DME'].includes(to)) return Math.floor(49 + Math.random() * 60);
  // Fallback
  return Math.floor(199 + Math.random() * 200);
}

// Pre-compute prices so they stay stable during render
const ROUTE_PRICE_CACHE = {};
function getStablePrice(from, to) {
  const key = `${from}-${to}`;
  if (!ROUTE_PRICE_CACHE[key]) ROUTE_PRICE_CACHE[key] = getRoutePrice(from, to);
  return ROUTE_PRICE_CACHE[key];
}

// Categorize routes by region for display
function getRouteCategory(from, to) {
  const isUS_f = US_AIRPORTS.has(from), isUS_t = US_AIRPORTS.has(to);
  const isMex_f = MEX_CARIBBEAN.has(from), isMex_t = MEX_CARIBBEAN.has(to);
  const isEur_f = EUR_AIRPORTS.has(from), isEur_t = EUR_AIRPORTS.has(to);
  const isAsia_f = ASIA_AIRPORTS.has(from), isAsia_t = ASIA_AIRPORTS.has(to);

  if (isUS_f && isUS_t) return 'us-domestic';
  if ((isUS_f && isEur_t) || (isEur_f && isUS_t)) return 'us-europe';
  if ((isUS_f && isAsia_t) || (isAsia_f && isUS_t)) return 'us-asia';
  if ((isUS_f && isMex_t) || (isMex_f && isUS_t)) return 'us-mexico';
  if (isEur_f && isEur_t) return 'europe';
  if (isAsia_f && isAsia_t) return 'asia';
  if ((isEur_f && isAsia_t) || (isAsia_f && isEur_t)) return 'europe-asia';
  return 'other';
}

const CATEGORY_LABELS = {
  'us-domestic': { en: '🇺🇸 US Domestic', ru: '🇺🇸 Внутри США' },
  'us-europe': { en: '✈️ US → Europe', ru: '✈️ США → Европа' },
  'us-asia': { en: '🌏 US → Asia', ru: '🌏 США → Азия' },
  'us-mexico': { en: '🏖️ US → Mexico & Caribbean', ru: '🏖️ США → Мексика и Карибы' },
  'europe': { en: '🇪🇺 Europe', ru: '🇪🇺 Европа' },
  'asia': { en: '🇯🇵 Asia', ru: '🇯🇵 Азия' },
  'europe-asia': { en: '🌍 Europe → Asia / Middle East', ru: '🌍 Европа → Азия / Ближний Восток' },
  'other': { en: '🌎 Other Routes', ru: '🌎 Другие направления' },
};

const CATEGORY_ORDER = ['us-domestic', 'us-europe', 'us-asia', 'us-mexico', 'europe', 'asia', 'europe-asia', 'other'];
const ROUTES_PER_CATEGORY = 6;

// Generate Aviasales affiliate link with UTM
function getAviasalesLink(from, to, lang, placement = 'home') {
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

// Get cheapest routes for "Hot Deals" section
function getCheapestRoutes(count = 6) {
  return [...POPULAR_ROUTES]
    .map(r => ({ ...r, price: getStablePrice(r.from, r.to) }))
    .sort((a, b) => a.price - b.price)
    .slice(0, count);
}

// Get social proof number (simulated)
function getSocialProofNumber() {
  // Returns a number between 1,200 and 1,500 that changes based on hour
  const hour = new Date().getHours();
  const base = 1200 + (hour * 10) % 300;
  return base.toLocaleString();
}

export default function App() {
  const { t, lang, setLang } = useI18n();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [filters, setFilters] = React.useState({ from: '', to: '', date: '' });
  const [fromInput, setFromInput] = React.useState('');
  const [toInput, setToInput] = React.useState('');
  const [openAdd, setOpenAdd] = React.useState(false);
  const [tab, setTab] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    const t = parseInt(params.get('tab'), 10);
    return [0, 1, 2].includes(t) ? t : 0;
  });
  const [expandedCats, setExpandedCats] = React.useState({});
  const searchCardRef = React.useRef(null);

  const handleRouteClick = (from, to) => {
    // Fill search form with clicked route
    setFilters((f) => ({ ...f, from, to }));
    setFromInput(getAirportLabel(from, lang));
    setToInput(getAirportLabel(to, lang));
    // Switch to search tab
    setTab(0);
    // Scroll to search card
    setTimeout(() => {
      searchCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    // Auto-trigger search
    setLoading(true);
    setHasSearched(true);
    api
      .get('/api/trips', { params: { from, to } })
      .then(({ data }) => setRows(data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  const fetchTrips = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.date) params.date = filters.date;
      const { data } = await api.get('/api/trips', { params });
      setRows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (trip) => {
    try {
      setLoading(true);
      const { data } = await api.post('/api/trips', trip);
      setRows((r) => [...r, data]);
      setOpenAdd(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Don't auto-fetch on page load — show empty state until user searches

  return (
    <>
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
            {t.appTitle}
          </Typography>
          <ToggleButtonGroup
            value={lang}
            exclusive
            onChange={(_, v) => v && setLang(v)}
            size="small"
            sx={{ mr: 1 }}
          >
            <ToggleButton value="ru" sx={{ px: 1.2, py: 0.3, fontSize: '0.75rem' }}>
              RU
            </ToggleButton>
            <ToggleButton value="en" sx={{ px: 1.2, py: 0.3, fontSize: '0.75rem' }}>
              EN
            </ToggleButton>
          </ToggleButtonGroup>
          <Chip label="beta" size="small" color="primary" variant="outlined" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* HERO SECTION — Value Proposition */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mb: 2,
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.8rem', md: '3.2rem' },
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {lang === 'ru'
              ? 'Найди дешёвые авиабилеты за 30 секунд'
              : 'Find cheap flights in 30 seconds'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontWeight: 400 }}>
            {lang === 'ru'
              ? '✈️ 200+ маршрутов • 💰 Цены от $29 • 🤖 AI-планировщик'
              : '✈️ 200+ routes • 💰 From $29 • 🤖 AI planner'}
          </Typography>
          
          {/* Quick Action Buttons — Top 3 Routes */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mb: 2 }}
          >
            {[
              { from: 'LAX', to: 'JFK', price: 89, fromCity: lang === 'ru' ? 'Лос-Анджелес' : 'Los Angeles', toCity: lang === 'ru' ? 'Нью-Йорк' : 'New York' },
              { from: 'LHR', to: 'CDG', price: 49, fromCity: lang === 'ru' ? 'Лондон' : 'London', toCity: lang === 'ru' ? 'Париж' : 'Paris' },
              { from: 'JFK', to: 'LHR', price: 299, fromCity: lang === 'ru' ? 'Нью-Йорк' : 'New York', toCity: lang === 'ru' ? 'Лондон' : 'London' },
            ].map((route) => (
              <Button
                key={`${route.from}-${route.to}`}
                variant="contained"
                size="large"
                href={getAviasalesLink(route.from, route.to, lang, 'home_quick')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('aviasales', 'home_quick', `${route.from}-${route.to}`)}
                sx={{
                  bgcolor: '#FF6B00',
                  '&:hover': { bgcolor: '#E55A00', transform: 'translateY(-2px)' },
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {route.fromCity} → {route.toCity} ${route.price}
              </Button>
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {lang === 'ru' ? 'Популярные направления — кликни и найди билет' : 'Popular routes — click to find tickets'}
          </Typography>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, borderBottom: '1px solid #e0e0e0' }}
        >
          <Tab label={t.tabSearch} />
          <Tab label={lang === 'ru' ? 'Отели' : 'Hotels'} />
          <Tab label={t.tabPlanner} />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ mt: 1 }}>
            <Card ref={searchCardRef} elevation={2} sx={{ mb: 3 }}>
              <CardHeader title={t.searchTitle} />
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  sx={{ mb: 2 }}
                >
                  <Autocomplete
                    options={AIRPORTS}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') return option;
                      return getAirportLabel(option.code, lang);
                    }}
                    renderOption={(props, option) => (
                      <li {...props} key={option.code}>
                        <span style={{ fontWeight: 600, marginRight: 6 }}>{option.code}</span>
                        {lang === 'ru' ? option.city_ru : option.city_en}
                      </li>
                    )}
                    value={AIRPORTS.find((a) => a.code === filters.from) || null}
                    onChange={(event, newValue) => {
                      const code = newValue?.code || '';
                      setFilters((f) => ({ ...f, from: code }));
                      setFromInput(code ? getAirportLabel(code, lang) : '');
                    }}
                    inputValue={fromInput}
                    onInputChange={(event, newInputValue, reason) => {
                      if (reason === 'input') setFromInput(newInputValue);
                      if (reason === 'clear') { setFromInput(''); setFilters((f) => ({ ...f, from: '' })); }
                    }}
                    filterOptions={(options, { inputValue }) => {
                      const q = inputValue.toLowerCase().trim();
                      if (!q) return options.slice(0, 15);
                      return options.filter((o) => {
                        const label = `${o.code} ${o.city_en} ${o.city_ru}`.toLowerCase();
                        return q.split(/\s+/).every((word) => label.includes(word));
                      });
                    }}
                    freeSolo
                    size="small"
                    renderInput={(params) => (
                      <TextField {...params} label={t.fromLabel} placeholder={lang === 'ru' ? 'Город или аэропорт' : 'City or airport'} />
                    )}
                    sx={{ minWidth: 200 }}
                  />
                  <Autocomplete
                    options={AIRPORTS}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') return option;
                      return getAirportLabel(option.code, lang);
                    }}
                    renderOption={(props, option) => (
                      <li {...props} key={option.code}>
                        <span style={{ fontWeight: 600, marginRight: 6 }}>{option.code}</span>
                        {lang === 'ru' ? option.city_ru : option.city_en}
                      </li>
                    )}
                    value={AIRPORTS.find((a) => a.code === filters.to) || null}
                    onChange={(event, newValue) => {
                      const code = newValue?.code || '';
                      setFilters((f) => ({ ...f, to: code }));
                      setToInput(code ? getAirportLabel(code, lang) : '');
                    }}
                    inputValue={toInput}
                    onInputChange={(event, newInputValue, reason) => {
                      if (reason === 'input') setToInput(newInputValue);
                      if (reason === 'clear') { setToInput(''); setFilters((f) => ({ ...f, to: '' })); }
                    }}
                    filterOptions={(options, { inputValue }) => {
                      const q = inputValue.toLowerCase().trim();
                      if (!q) return options.slice(0, 15);
                      return options.filter((o) => {
                        const label = `${o.code} ${o.city_en} ${o.city_ru}`.toLowerCase();
                        return q.split(/\s+/).every((word) => label.includes(word));
                      });
                    }}
                    freeSolo
                    size="small"
                    renderInput={(params) => (
                      <TextField {...params} label={t.toLabel} placeholder={lang === 'ru' ? 'Город или аэропорт' : 'City or airport'} />
                    )}
                    sx={{ minWidth: 200 }}
                  />
                  <TextField
                    label={t.dateLabel}
                    type="date"
                    size="small"
                    value={filters.date}
                    onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Button variant="contained" onClick={fetchTrips} size="small" sx={{ px: 3 }}>
                    {t.searchBtn}
                  </Button>
                  <Button variant="outlined" onClick={() => setOpenAdd(true)} size="small">
                    {t.addBtn}
                  </Button>
                </Stack>

                {hasSearched && (
                  <>
                    <Divider sx={{ mb: 2 }} />
                    {loading ? (
                      <Stack alignItems="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </Stack>
                    ) : (
                      <TripsTable rows={rows} />
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <AddTripDialog
              open={openAdd}
              onClose={() => setOpenAdd(false)}
              onSubmit={handleAdd}
            />

            {/* SOCIAL PROOF */}
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 3 }}>
              <TrendingUpIcon color="success" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {lang === 'ru'
                  ? `🔥 Сегодня найдено ${getSocialProofNumber()} дешёвых рейсов`
                  : `🔥 Found ${getSocialProofNumber()} cheap flights today`}
              </Typography>
            </Stack>

            {/* HOT DEALS SECTION */}
            <Card elevation={2} sx={{ mb: 3, border: '2px solid #FF6B00' }}>
              <CardHeader
                title={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocalFireDepartmentIcon color="error" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {lang === 'ru' ? '🔥 ГОРЯЩИЕ БИЛЕТЫ' : '🔥 HOT DEALS'}
                    </Typography>
                  </Stack>
                }
                subheader={lang === 'ru' ? 'Самые низкие цены на сегодня' : 'Lowest prices today'}
                sx={{ bgcolor: 'rgba(255, 107, 0, 0.05)' }}
              />
              <CardContent>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}
                >
                  {getCheapestRoutes(6).map((r) => {
                    const fromCity = lang === 'ru' ? r.fromCity_ru : r.fromCity_en;
                    const toCity = lang === 'ru' ? r.toCity_ru : r.toCity_en;
                    return (
                      <Card
                        key={`hot-${r.from}-${r.to}`}
                        variant="outlined"
                        sx={{
                          position: 'relative',
                          minHeight: '90px',
                          '&:hover': { boxShadow: 2 },
                          cursor: 'pointer',
                        }}
                        onClick={() => window.open(getAviasalesLink(r.from, r.to, lang, 'home_hot'), '_blank')}
                      >
                        {/* Popular route badge */}
                        <Chip
                          label={lang === 'ru' ? '🔥 Популярный' : '🔥 Popular'}
                          size="small"
                          color="error"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Typography sx={{
                            fontWeight: 500,
                            mb: 0.5,
                            fontSize: '13px',
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {fromCity} → {toCity}
                          </Typography>
                          <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                            ${r.price}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {lang === 'ru' ? 'Актуальная цена' : 'Current price'}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {tab === 1 && <Hotels />}

        {tab === 2 && <Planner />}

        {/* Email subscribe */}
        <SubscribeBlock />

        {/* Popular routes — grouped by region */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          {lang === 'ru' ? '✈️ Популярные направления' : '✈️ Popular Routes'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {lang === 'ru'
            ? 'Дешёвые авиабилеты по популярным маршрутам'
            : 'Cheap flights on popular routes'}
        </Typography>
        {(() => {
          // Group routes by category
          const grouped = {};
          POPULAR_ROUTES.forEach((r) => {
            const cat = getRouteCategory(r.from, r.to);
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(r);
          });

          return CATEGORY_ORDER.filter((cat) => grouped[cat]?.length > 0).map((cat) => {
            const isExpanded = expandedCats[cat];
            const allRoutes = grouped[cat];
            const visibleRoutes = isExpanded ? allRoutes : allRoutes.slice(0, ROUTES_PER_CATEGORY);
            const hasMore = allRoutes.length > ROUTES_PER_CATEGORY;

            return (
              <Box key={cat} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
                  {CATEGORY_LABELS[cat][lang]}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 1,
                  }}
                >
                  {visibleRoutes.map((r) => {
                    const price = getStablePrice(r.from, r.to);
                    const fromCity = lang === 'ru' ? r.fromCity_ru : r.fromCity_en;
                    const toCity = lang === 'ru' ? r.toCity_ru : r.toCity_en;
                    return (
                      <Chip
                        key={`${r.from}-${r.to}`}
                        label={
                          <span>
                            {fromCity} → {toCity}{' '}
                            <strong style={{ color: '#2e7d32' }}>${price}</strong>
                          </span>
                        }
                        onClick={() => handleRouteClick(r.from, r.to)}
                        clickable
                        variant="outlined"
                        size="small"
                        icon={<SearchIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          justifyContent: 'flex-start',
                          height: 'auto',
                          py: 0.5,
                          '& .MuiChip-label': {
                            whiteSpace: 'normal',
                            lineHeight: 1.3,
                          },
                        }}
                      />
                    );
                  })}
                </Box>
                {hasMore && !isExpanded && (
                  <Button
                    size="small"
                    onClick={() => setExpandedCats((prev) => ({ ...prev, [cat]: true }))}
                    endIcon={<ExpandMoreIcon />}
                    sx={{ mt: 1, textTransform: 'none' }}
                  >
                    {lang === 'ru'
                      ? `Ещё ${allRoutes.length - ROUTES_PER_CATEGORY} направлений`
                      : `Show ${allRoutes.length - ROUTES_PER_CATEGORY} more`}
                  </Button>
                )}
              </Box>
            );
          });
        })()}
        <Stack direction="row" spacing={2}>
          <Button component={RouterLink} to={`/${lang}/flights`} variant="text" size="small">
            {lang === 'ru' ? 'Все направления →' : 'All routes →'}
          </Button>
          <Button component={RouterLink} to={`/${lang}/blog`} variant="text" size="small">
            {lang === 'ru' ? '📝 Блог →' : '📝 Blog →'}
          </Button>
        </Stack>
      </Container>

      {/* STICKY MOBILE CTA */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: { xs: 'block', sm: 'none' },
          bgcolor: 'background.paper',
          borderTop: '2px solid #FF6B00',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Container maxWidth="md" sx={{ py: 1.5 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            href="https://www.aviasales.ru/?utm_source=travelsearch.now&utm_medium=home_sticky_mobile&utm_campaign=funnel_v1&marker=681967"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick('aviasales', 'home_sticky_mobile', 'generic')}
            sx={{
              bgcolor: '#00C853',
              '&:hover': { bgcolor: '#00B548' },
              py: 1.5,
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            {lang === 'ru' ? '✈️ Найти дешёвый билет' : '✈️ Find cheap flights'}
          </Button>
        </Container>
      </Box>
    </>
  );
}
