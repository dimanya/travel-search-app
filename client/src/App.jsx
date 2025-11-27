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
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

import TripsTable from './components/TripsTable';
import AddTripDialog from './components/AddTripDialog';
import Planner from './components/Planner';
import { api } from './api';

export default function App() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({ from: '', to: '' });
  const [openAdd, setOpenAdd] = React.useState(false);
  const [tab, setTab] = React.useState(0);

  // загрузка списка поездок
  const fetchTrips = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      const { data } = await api.get('/api/trips', { params });
      setRows(data);
    } catch (e) {
      console.error(e);
      alert('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  // добавление новой поездки
  const handleAdd = async (trip) => {
    try {
      setLoading(true);
      const { data } = await api.post('/api/trips', trip);
      setRows((r) => [...r, data]);
      setOpenAdd(false);
    } catch (e) {
      console.error(e);
      alert('Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <>
      {/* Верхняя панель */}
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
          <Chip label="beta" size="small" color="primary" variant="outlined" />
        </Toolbar>
      </AppBar>

      {/* Основной контент */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Travel Search App — beta версия. Маршруты и цены примерные, проверяйте детали перед
          бронированием.
        </Alert>

                <Typography variant="h5" sx={{ mb: 1.5 }}>
          Найди идеальную поездку
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          На вкладке Search — тестовый поиск и список поездок. На вкладке AI Planner — умный маршрут
          и примерная смета.
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, borderBottom: '1px solid #e0e0e0' }}
        >
          <Tab label="Search" />
          <Tab label="AI Planner" />
        </Tabs>

                {/* Вкладка SEARCH */}
        {tab === 0 && (
          <Box sx={{ mt: 1 }}>
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardHeader
                title="Flight Sandbox Search"
                subheader="Тестовый поиск рейсов: отфильтруй список и добавляй свои поездки вручную."
              />
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  sx={{ mb: 2 }}
                >
                  <TextField
                    label="From"
                    size="small"
                    value={filters.from}
                    onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                  />
                  <TextField
                    label="To"
                    size="small"
                    value={filters.to}
                    onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                  />
                  <Button
                    variant="contained"
                    onClick={fetchTrips}
                    size="small"
                    sx={{ px: 3 }}
                  >
                    Поиск
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setOpenAdd(true)}
                    size="small"
                  >
                    Добавить
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

        {/* Вкладка AI Planner */}
        {tab === 1 && <Planner />}
      </Container>
    </>
  );
}