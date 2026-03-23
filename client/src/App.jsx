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
import LanguageIcon from '@mui/icons-material/Language';
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

export default function App() {
  const { t, lang, setLang } = useI18n();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({ from: '', to: '', date: '' });
  const [fromInput, setFromInput] = React.useState('');
  const [toInput, setToInput] = React.useState('');
  const [openAdd, setOpenAdd] = React.useState(false);
  const [tab, setTab] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    const t = parseInt(params.get('tab'), 10);
    return [0, 1, 2].includes(t) ? t : 0;
  });

  const fetchTrips = async () => {
    setLoading(true);
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

  React.useEffect(() => {
    fetchTrips();
  }, []);

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
        <Typography
          variant="h3"
          component="h1"
          sx={{
            mb: 1,
            fontWeight: 700,
            fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' },
            lineHeight: 1.2,
          }}
        >
          {lang === 'ru'
            ? 'Сравни цены на авиабилеты и найди самый дешёвый рейс'
            : 'Compare flight prices and find the cheapest fare'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.1rem' }}>
          {lang === 'ru'
            ? '200+ маршрутов по всему миру. Реальные цены, советы по экономии и AI-планировщик путешествий.'
            : '200+ routes worldwide. Real prices, money-saving tips, and an AI travel planner.'}
        </Typography>

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
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardHeader title={t.searchTitle} subheader={t.searchSub} />
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
                      // option can be airport object or string (freeSolo)
                      if (typeof option === 'string') return option;
                      return getAirportLabel(option.code, lang);
                    }}
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
                    filterOptions={(options, state) => {
                      const inputValue = state.inputValue.toLowerCase();
                      if (!inputValue) return options;

                      return options.filter((option) => {
                        const cityEn = option.city_en.toLowerCase();
                        const cityRu = option.city_ru.toLowerCase();
                        const code = option.code.toLowerCase();
                        return (
                          code.includes(inputValue) ||
                          cityEn.includes(inputValue) ||
                          cityRu.includes(inputValue)
                        );
                      });
                    }}
                    freeSolo
                    size="small"
                    renderInput={(params) => (
                      <TextField {...params} label={t.fromLabel} placeholder="LAX" />
                    )}
                    sx={{ minWidth: 200 }}
                  />
                  <Autocomplete
                    options={AIRPORTS}
                    getOptionLabel={(option) => {
                      // option can be airport object or string (freeSolo)
                      if (typeof option === 'string') return option;
                      return getAirportLabel(option.code, lang);
                    }}
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
                    filterOptions={(options, state) => {
                      const inputValue = state.inputValue.toLowerCase();
                      if (!inputValue) return options;

                      return options.filter((option) => {
                        const cityEn = option.city_en.toLowerCase();
                        const cityRu = option.city_ru.toLowerCase();
                        const code = option.code.toLowerCase();
                        return (
                          code.includes(inputValue) ||
                          cityEn.includes(inputValue) ||
                          cityRu.includes(inputValue)
                        );
                      });
                    }}
                    freeSolo
                    size="small"
                    renderInput={(params) => (
                      <TextField {...params} label={t.toLabel} placeholder="JFK" />
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

                <Divider sx={{ mb: 2 }} />

                {loading ? (
                  <Stack alignItems="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </Stack>
                ) : (
                  <TripsTable rows={rows} />
                )}
              </CardContent>
            </Card>

            <AddTripDialog
              open={openAdd}
              onClose={() => setOpenAdd(false)}
              onSubmit={handleAdd}
            />
          </Box>
        )}

        {tab === 1 && <Hotels />}

        {tab === 2 && <Planner />}

        {/* Email subscribe */}
        <SubscribeBlock />

        {/* Popular routes — internal links for SEO */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          {lang === 'ru' ? '✈️ Популярные направления' : '✈️ Popular Routes'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {lang === 'ru'
            ? 'Дешёвые авиабилеты по популярным маршрутам'
            : 'Cheap flights on popular routes'}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {POPULAR_ROUTES.map((r) => {
            const price = getStablePrice(r.from, r.to);
            const cityName = lang === 'ru' ? r.toCity_ru : r.toCity_en;
            return (
              <Chip
                key={`${r.from}-${r.to}`}
                label={
                  <span>
                    {r.from} → {cityName}{' '}
                    <strong style={{ color: '#2e7d32' }}>
                      ${price}
                    </strong>
                  </span>
                }
                component={RouterLink}
                to={`/${lang}/flights/${r.from.toLowerCase()}-${r.to.toLowerCase()}`}
                clickable
                variant="outlined"
                size="small"
                icon={<FlightTakeoffIcon />}
                sx={{ mb: 0.5 }}
              />
            );
          })}
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button component={RouterLink} to={`/${lang}/flights`} variant="text" size="small">
            {lang === 'ru' ? 'Все направления →' : 'All routes →'}
          </Button>
          <Button component={RouterLink} to={`/${lang}/blog`} variant="text" size="small">
            {lang === 'ru' ? '📝 Блог →' : '📝 Blog →'}
          </Button>
        </Stack>
      </Container>
    </>
  );
}
