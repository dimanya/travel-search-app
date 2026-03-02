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
  Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HotelIcon from '@mui/icons-material/Hotel';
import MapIcon from '@mui/icons-material/Map';
import { api, trackClick } from '../api';
import { useI18n } from '../i18n';

/* ========= Affiliate & links helpers ========= */
const TP_MARKER = import.meta.env.VITE_TP_MARKER || '681967';
const BOOKING_AID = import.meta.env.VITE_BOOKING_AID || '2709056';

const mapsLink = (q) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || '')}`;

const flightsLink = (origin, dest) => {
  if (origin && dest) {
    return `https://www.aviasales.com/search/${encodeURIComponent(origin)}${encodeURIComponent(dest)}1?marker=${TP_MARKER}`;
  }
  return `https://www.aviasales.com/?marker=${TP_MARKER}`;
};

const hotelsLink = (city) => {
  const base = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city || '')}`;
  return BOOKING_AID ? `${base}&aid=${BOOKING_AID}` : base;
};

/* ========= URL sharing helpers ========= */
function getShareUrl(form) {
  const params = new URLSearchParams();
  if (form.origin) params.set('origin', form.origin);
  if (form.days) params.set('days', String(form.days));
  if (form.budget) params.set('budget', form.budget);
  if (form.interests) params.set('interests', form.interests);
  if (form.date) params.set('date', form.date);
  params.set('tab', '1');
  params.set('auto', '1');
  return `${window.location.origin}/?${params.toString()}`;
}

function getParamsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    origin: params.get('origin') || '',
    days: params.get('days') || '',
    budget: params.get('budget') || '',
    interests: params.get('interests') || '',
    date: params.get('date') || '',
    auto: params.get('auto') === '1',
  };
}
/* ============================================ */

export default function Planner() {
  const { t } = useI18n();
  const urlParams = React.useMemo(() => getParamsFromUrl(), []);

  const [form, setForm] = React.useState({
    origin: urlParams.origin || 'Los Angeles',
    days: Number(urlParams.days) || 3,
    budget: urlParams.budget || 'medium',
    interests: urlParams.interests || 'beaches, food',
    date: urlParams.date || '',
  });
  const [loading, setLoading] = React.useState(false);
  const [plan, setPlan] = React.useState(null);
  const [error, setError] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [shareSnack, setShareSnack] = React.useState(false);
  const autoTriggered = React.useRef(false);

  const onChange = (e) =>
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value,
    }));

  const requestPlan = React.useCallback(async () => {
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
      setError(serverMsg || e?.message || 'Не удалось сгенерировать маршрут. Повторите позже.');
    } finally {
      setLoading(false);
    }
  }, [form]);

  // Auto-generate plan when opened via share link
  React.useEffect(() => {
    if (urlParams.auto && !autoTriggered.current) {
      autoTriggered.current = true;
      requestPlan();
    }
  }, [urlParams.auto, requestPlan]);

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

  const handleShare = async () => {
    const url = getShareUrl(form);
    const shareData = {
      title: plan?.title || 'Маршрут путешествия',
      text: `Посмотри мой маршрут: ${plan?.title || ''}`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setShareSnack(true);
      }
    } catch (e) {
      // User cancelled share or fallback
      if (e.name !== 'AbortError') {
        await navigator.clipboard.writeText(url);
        setShareSnack(true);
      }
    }
    trackClick({ type: 'share', destination: form.origin });
  };

  const handleFlightsClick = (city) => {
    trackClick({ type: 'flights', origin: form.origin, destination: city });
  };

  const handleHotelsClick = (city) => {
    trackClick({ type: 'hotels', destination: city });
  };

  const handleMapsClick = (city) => {
    trackClick({ type: 'maps', destination: city });
  };

  return (
    <Stack spacing={2}>
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardHeader
          title={t.plannerTitle}
          subheader={t.plannerSub}
          sx={{ pb: 0.5 }}
        />
        <CardContent sx={{ pt: 1.5 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'flex-end' }}
          >
            <Stack direction="column" spacing={1.2} flex={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  name="origin"
                  label={t.originLabel}
                  value={form.origin}
                  onChange={onChange}
                  size="small"
                  fullWidth
                />
                <TextField
                  name="days"
                  type="number"
                  label={t.daysLabel}
                  value={form.days}
                  onChange={onChange}
                  size="small"
                  inputProps={{ min: 1, max: 30 }}
                  sx={{ width: { xs: '100%', sm: 110 } }}
                />
                <TextField
                  name="budget"
                  label={t.budgetLabel}
                  value={form.budget}
                  onChange={onChange}
                  size="small"
                  sx={{ minWidth: 180 }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  name="interests"
                  label={t.interestsLabel}
                  value={form.interests}
                  onChange={onChange}
                  size="small"
                  fullWidth
                />
                <TextField
                  name="date"
                  type="date"
                  label={t.departureDateLabel}
                  value={form.date || ''}
                  onChange={onChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: { xs: '100%', sm: 180 } }}
                />
              </Stack>
            </Stack>

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
              {loading ? t.generatingBtn : t.generateBtn}
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
              label={t.copiedMsg}
              size="small"
              sx={{ mt: 2 }}
            />
          )}
        </CardContent>
      </Card>

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
                  {t.estimatedTotal}: ${plan.totalEstimatedCost}
                </Typography>
              )}
            </div>

            <Stack direction="row" spacing={1}>
              <Tooltip title={t.copyRoute}>
                <IconButton onClick={handleCopy}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t.shareRoute}>
                <IconButton onClick={handleShare} color="primary">
                  <ShareIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {Array.isArray(plan?.days) &&
            plan.days.map((d, idx) => (
              <Accordion key={d?.day || idx} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {t.day} {d?.day ?? idx + 1}: {d?.city ?? '—'}
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
                      onClick={() => handleMapsClick(d?.city)}
                    >
                      Google Maps
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FlightTakeoffIcon />}
                      href={flightsLink(form.origin, d?.city)}
                      target="_blank"
                      size="small"
                      onClick={() => handleFlightsClick(d?.city)}
                    >
                      {t.tickets}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<HotelIcon />}
                      href={hotelsLink(d?.city)}
                      target="_blank"
                      size="small"
                      onClick={() => handleHotelsClick(d?.city)}
                    >
                      {t.hotels}
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}

          {Array.isArray(plan?.tips) && plan.tips.length > 0 && (
            <Card elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2 }}>
              <CardHeader title={t.tips} />
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

      <Snackbar
        open={shareSnack}
        autoHideDuration={3000}
        onClose={() => setShareSnack(false)}
        message={t.linkCopied}
      />
    </Stack>
  );
}
