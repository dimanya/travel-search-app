import * as React from 'react';
import {
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
  Collapse,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { api } from '../api';
import { useI18n } from '../i18n';

export default function SubscribeBlock() {
  const { lang } = useI18n();
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState(null); // 'ok' | 'error' | 'exists'
  const [loading, setLoading] = React.useState(false);
  const isRu = lang === 'ru';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setLoading(true);
    setStatus(null);
    try {
      const { data } = await api.post('/api/subscribe', { email: email.trim(), lang });
      setStatus(data.status || 'ok'); // 'ok' | 'exists'
      if (data.status === 'ok') setEmail('');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: '#fff',
        borderRadius: 3,
        mt: 3,
        mb: 2,
      }}
    >
      <CardContent sx={{ py: 3, px: { xs: 2, sm: 4 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <MailOutlineIcon />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {isRu ? 'Дешёвые билеты — в вашей почте' : 'Cheap flights — in your inbox'}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
          {isRu
            ? 'Подпишись и получай лучшие предложения на авиабилеты и отели. Без спама, только выгодные цены.'
            : 'Subscribe to get the best flight and hotel deals. No spam, just great prices.'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              type="email"
              placeholder={isRu ? 'Ваш email' : 'Your email'}
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              sx={{
                bgcolor: 'rgba(255,255,255,0.95)',
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#ff9800',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 999,
                px: 4,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#f57c00' },
              }}
            >
              {loading
                ? '...'
                : isRu ? 'Подписаться' : 'Subscribe'}
            </Button>
          </Stack>
        </form>

        <Collapse in={status === 'ok'}>
          <Alert severity="success" sx={{ mt: 2 }}>
            {isRu ? '✅ Вы подписаны! Ждите лучшие предложения.' : '✅ Subscribed! Expect great deals.'}
          </Alert>
        </Collapse>
        <Collapse in={status === 'exists'}>
          <Alert severity="info" sx={{ mt: 2 }}>
            {isRu ? 'Вы уже подписаны 👍' : 'You are already subscribed 👍'}
          </Alert>
        </Collapse>
        <Collapse in={status === 'error'}>
          <Alert severity="error" sx={{ mt: 2 }}>
            {isRu ? 'Ошибка. Попробуйте позже.' : 'Error. Please try again later.'}
          </Alert>
        </Collapse>
      </CardContent>
    </Card>
  );
}
