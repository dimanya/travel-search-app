import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Stack,
  Button,
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HotelIcon from '@mui/icons-material/Hotel';
import MapIcon from '@mui/icons-material/Map';
import { api } from '../api';

/* ========= Affiliate & links helpers ========= */
const TP_FLIGHTS_URL =
  import.meta.env.VITE_TP_FLIGHTS_URL ||
  'https://www.aviasales.com/?marker=681967.Zz5de59a4e77234235b0b456b-681967';

const mapsLink = (q) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || '')}`;

const flightsLink = () => TP_FLIGHTS_URL || 'https://www.aviasales.com/';

const hotelsLink = (city) =>
  `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city || '')}`;
/* ============================================ */

export default function Planner() {
  const [form, setForm] = React.useState({
    origin: 'Los Angeles',
    days: 3,
    budget: 'medium',
    interests: 'beaches, food',
    date: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [plan, setPlan] = React.useState(null);
  const [error, setError] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const onChange = (e) =>
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value,
    }));

  const requestPlan = async () => {
    setLoading(true);
    setError('');
    setCopied(false);
    try {
      const { data } = await api.post('/api/plan', {
        origin: form.origin,
        days: Number(form.days) || 3,
        budget: form.budget,
        interests: form.interests,
        date: form.date || '',
      });
      setPlan(data);
    } catch (e) {
      console.error(e);
      const serverMsg = e?.response?.data?.error || e?.response?.data?.details;
      const msg = serverMsg || e?.message || 'Не удалось сгенерировать маршрут. Повторите позже.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const buildPlainTextPlan = () => {
    if (!plan) return '';
    let text = '';
    if (plan.title) text += `${plan.title}\n\n`;
    if (typeof plan.totalEstimatedCost !== 'undefined') {
      text += `Примерная сумма: $${plan.totalEstimatedCost}\n\n`;
    }
    if (Array.isArray(plan.days)) {
      plan.days.forEach((d) => {
        text += `День ${d?.day}: ${d?.city || ''}\n`;
        if (d?.summary) text += `${d.summary}\n`;
        if (Array.isArray(d.activities)) {
          d.activities.forEach((a) => {
            text += ` - ${a?.time ? `${a.time} · ` : ''}${a?.name || 'Activity'}`;
            if (typeof a?.estCost === 'number') text += ` (~$${a.estCost})`;
            if (a?.note) text += ` — ${a.note}`;
            text += '\n';
          });
        }
        text += '\n';
      });
    }
    if (Array.isArray(plan.tips) && plan.tips.length) {
      text += 'Советы:\n';
      plan.tips.forEach((t) => {
        text += ` - ${t}\n`;
      });
    }
    return text.trim();
  };

  const handleCopy = async () => {
    try {
      const text = buildPlainTextPlan();
      if (!text) return;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
      setError('Не удалось скопировать маршрут в буфер обмена.');
    }
  };

  return (
    <Stack spacing={2}>
      <Card
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardHeader
          title="AI Travel Planner"
          subheader="Сгенерируй маршрут и примерную смету с помощью AI"
          sx={{ pb: 0.5 }}
        />
        <CardContent sx={{ pt: 1.5 }}>
          {/* Верхняя форма */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'flex-end' }}
          >
            <Stack direction="column" spacing={1.2} flex={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  name="origin"
                  label="Город отправления"
                  value={form.origin}
                  onChange={onChange}
                  size="small"
                  fullWidth
                />
                <TextField
                  name="days"
                  type="number"
                  label="Дней"
                  value={form.days}
                  onChange={onChange}
                  size="small"
                  inputProps={{ min: 1, max: 30 }}
                  sx={{ width: { xs: '100%', sm: 110 } }}
                />
                <TextField
                  name="budget"
                  label="Бюджет (low/medium/high)"
                  value={form.budget}
                  onChange={onChange}
                  size="small"
                  sx={{ minWidth: 180 }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  name="interests"
                  label="Интересы"
                  value={form.interests}
                  onChange={onChange}
                  size="small"
                  fullWidth
                />
                <TextField
                  name="date"
                  type="date"
                  label="Дата вылета"
                  value={form.date || ''}
                  onChange={onChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: { xs: '100%', sm: 180 } }}
                />
              </Stack>
            </Stack>

            {/* Кнопка справа */}
            <Button
              variant="contained"
              onClick={requestPlan}
              disabled={loading}
              sx={{
                minWidth: 160,
                px: 3,
                py: 1.4,
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                alignSelf: { xs: 'stretch', md: 'flex-end' },
              }}
            >
              {loading ? 'Генерируем...' : 'Генерировать'}
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {copied && !error && (
            <Chip
              color="success"
              label="Маршрут скопирован в буфер обмена"
              size="small"
              sx={{ mt: 2 }}
            />
          )}
        </CardContent>
      </Card>

      {/* Лоадер / результат */}
      {loading && (
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <CircularProgress />
        </Stack>
      )}

      {plan && !loading && (
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            rowGap={1}
          >
            <div>
              {plan?.title && (
                <Typography variant="h5" sx={{ mb: 0.5 }}>
                  {plan.title}
                </Typography>
              )}
              {typeof plan?.totalEstimatedCost !== 'undefined' && (
                <Typography variant="subtitle1">
                  Примерная сумма: ${plan.totalEstimatedCost}
                </Typography>
              )}
            </div>

            <Tooltip title="Скопировать маршрут">
              <IconButton onClick={handleCopy}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          {Array.isArray(plan?.days) &&
            plan.days.map((d, idx) => (
              <Accordion key={d?.day || idx} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  День {d?.day ?? idx + 1}: {d?.city ?? '—'}
                </AccordionSummary>
                <AccordionDetails>
                  {d?.summary && (
                    <Typography sx={{ mb: 1 }} variant="body2">
                      {d.summary}
                    </Typography>
                  )}

                  {Array.isArray(d?.activities) && (
                    <ul style={{ marginTop: 0 }}>
                      {d.activities.map((a, i) => (
                        <li key={i}>
                          <strong>
                            {a?.time ? `${a.time} · ` : ''}
                            {a?.name ?? 'Activity'}
                          </strong>
                          {typeof a?.estCost === 'number' ? ` — ~$${a.estCost}` : ''}
                          {a?.note ? ` — ${a.note}` : ''}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                    <Button
                      startIcon={<MapIcon />}
                      href={mapsLink(d?.city)}
                      target="_blank"
                      size="small"
                    >
                      Google Maps
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FlightTakeoffIcon />}
                      href={flightsLink()}
                      target="_blank"
                      size="small"
                    >
                      Билеты
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<HotelIcon />}
                      href={hotelsLink(d?.city)}
                      target="_blank"
                      size="small"
                    >
                      Отели
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}

          {Array.isArray(plan?.tips) && plan.tips.length > 0 && (
            <Card elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2 }}>
              <CardHeader title="Советы" />
              <CardContent>
                <ul style={{ marginTop: 0 }}>
                  {plan.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
    </Stack>
  );
}