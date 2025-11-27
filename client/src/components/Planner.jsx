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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { api } from '../api';

/* ========= Affiliate & links helpers ========= */
const TP_SHMARKER = import.meta.env.VITE_TP_SHMARKER || '';
const TP_PROMO_ID = import.meta.env.VITE_TP_PROMO_ID || '7879'; // универсальный промо Travelpayouts/Aviasales
const BOOKING_AID = import.meta.env.VITE_BOOKING_AID || '';
const TP_FLIGHTS_URL = import.meta.env.VITE_TP_FLIGHTS_URL || '';

const cityToIata = (city) => {
  const map = {
    'los angeles': 'LAX',
    'new york': 'JFK',
    'san francisco': 'SFO',
    'seattle': 'SEA',
    'san diego': 'SAN',
    'las vegas': 'LAS',
    'miami': 'MIA',
    'chicago': 'ORD',
  };
  return map[String(city || '').toLowerCase()] || String(city || 'LAX').slice(0, 3).toUpperCase();
};

const mapsLink = (q) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const flightsLink = () => {
  // Если в .env прописана своя партнёрская ссылка Aviasales — используем её
  if (TP_FLIGHTS_URL) return TP_FLIGHTS_URL;

  // запасной вариант (если вдруг .env пустой)
  return 'https://www.aviasales.com/?marker=681967';
};

const hotelsLink = (city) => {
  const base = 'https://www.booking.com/searchresults.html';
  const params = new URLSearchParams({
    aid: BOOKING_AID,
    ss: city || 'Los Angeles',
  });
  return `${base}?${params.toString()}`;
};
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

  const onChange = (e) =>
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value,
    }));

  const requestPlan = async () => {
    setLoading(true);
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
      const msg = serverMsg || e?.message || 'Ошибка генерации плана';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Card>
        <CardHeader title="AI Travel Planner" subheader="Сгенерируй маршрут и примерную смету" />
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="origin"
              label="Город отправления"
              value={form.origin}
              onChange={onChange}
            />
            <TextField name="days" type="number" label="Дней" value={form.days} onChange={onChange} />
            <TextField
              name="budget"
              label="Бюджет (low/medium/high)"
              value={form.budget}
              onChange={onChange}
            />
            <TextField
              name="interests"
              label="Интересы"
              value={form.interests}
              onChange={onChange}
              fullWidth
            />
            <TextField
              name="date"
              type="date"
              label="Дата вылета"
              value={form.date || ''}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={requestPlan}>
              Сгенерировать
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading && <CircularProgress />}

      {plan && (
        <Stack spacing={2}>
          {plan?.title && <Typography variant="h5">{plan.title}</Typography>}
          {typeof plan?.totalEstimatedCost !== 'undefined' && (
            <Typography variant="subtitle1">
              Примерная сумма: ${plan.totalEstimatedCost}
            </Typography>
          )}

          {Array.isArray(plan?.days) &&
            plan.days.map((d, idx) => (
              <Accordion key={d?.day || idx} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  День {d?.day ?? idx + 1}: {d?.city ?? '—'}
                </AccordionSummary>
                <AccordionDetails>
                  {d?.summary && (
                    <Typography sx={{ mb: 1 }}>{d.summary}</Typography>
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
                  <Stack direction="row" spacing={1}>
                    <Button href={mapsLink(d?.city || '')} target="_blank">
                      Google Maps
                    </Button>
                    <Button
  variant="outlined"
  href={flightsLink()}
  target="_blank"
>
  Билеты
</Button>
                    <Button
                      variant="outlined"
                      href={hotelsLink(d?.city || '')}
                      target="_blank"
                      title={
                        BOOKING_AID ? '' : 'Добавь VITE_BOOKING_AID в client/.env для трекинга комиссий'
                      }
                    >
                      Отели
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}

          {Array.isArray(plan?.tips) && plan.tips.length > 0 && (
            <Card>
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
