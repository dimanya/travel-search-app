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

export default function App() {
  const { t, lang, setLang } = useI18n();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({ from: '', to: '', date: '' });
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
        <Alert severity="info" sx={{ mb: 2 }}>
          {t.betaAlert}
        </Alert>

        <Typography variant="h5" sx={{ mb: 1.5 }}>
          {t.heroTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t.heroSub}
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
                  <TextField
                    label={t.fromLabel}
                    size="small"
                    placeholder="LAX"
                    value={filters.from}
                    onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                  />
                  <TextField
                    label={t.toLabel}
                    size="small"
                    placeholder="JFK"
                    value={filters.to}
                    onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
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
          {POPULAR_ROUTES.map((r) => (
            <Chip
              key={`${r.from}-${r.to}`}
              label={`${r.from} → ${r.to}`}
              component={RouterLink}
              to={`/${lang}/flights/${r.from.toLowerCase()}-${r.to.toLowerCase()}`}
              clickable
              variant="outlined"
              size="small"
              icon={<FlightTakeoffIcon />}
              sx={{ mb: 0.5 }}
            />
          ))}
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
