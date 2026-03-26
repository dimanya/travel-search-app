import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Stack,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { trackClick } from '../api';
import { useI18n } from '../i18n';

const TP_MARKER = import.meta.env.VITE_TP_MARKER || '681967';

function hotellookLink(city, checkIn, checkOut) {
  const params = new URLSearchParams({
    marker: TP_MARKER,
  });
  if (checkIn) params.set('checkIn', checkIn);
  if (checkOut) params.set('checkOut', checkOut);
  return `https://search.hotellook.com/?destination=${encodeURIComponent(city)}&${params}`;
}

const POPULAR_DESTINATIONS = [
  { city: 'New York', emoji: '🗽', priceHint: '$150-400' },
  { city: 'Paris', emoji: '🗼', priceHint: '€100-350' },
  { city: 'London', emoji: '🇬🇧', priceHint: '£120-380' },
  { city: 'Tokyo', emoji: '🗾', priceHint: '¥8000-25000' },
  { city: 'Dubai', emoji: '🏙️', priceHint: '$120-500' },
  { city: 'Istanbul', emoji: '🕌', priceHint: '$50-200' },
  { city: 'Bangkok', emoji: '🛕', priceHint: '$30-150' },
  { city: 'Cancun', emoji: '🏖️', priceHint: '$100-350' },
  { city: 'Los Angeles', emoji: '🌴', priceHint: '$120-400' },
  { city: 'Miami', emoji: '🌊', priceHint: '$100-350' },
  { city: 'Москва', emoji: '🏰', priceHint: '₽3000-15000' },
  { city: 'Санкт-Петербург', emoji: '⛪', priceHint: '₽2500-12000' },
];

function DestinationCard({ dest, checkIn, checkOut }) {
  const handleHotellook = () => {
    trackClick({ type: 'hotels-hotellook', destination: dest.city });
  };

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {dest.emoji} {dest.city}
          </Typography>
          <Chip label={dest.priceHint} size="small" color="primary" variant="outlined" />
        </Stack>
        <Button
          variant="contained"
          size="small"
          fullWidth
          startIcon={<HotelIcon />}
          endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
          href={hotellookLink(dest.city, checkIn, checkOut)}
          target="_blank"
          rel="noopener"
          onClick={handleHotellook}
          sx={{ textTransform: 'none', borderRadius: 999, mt: 2 }}
        >
          Hotellook
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Hotels() {
  const { lang } = useI18n();
  const [city, setCity] = React.useState('');
  const [checkIn, setCheckIn] = React.useState('');
  const [checkOut, setCheckOut] = React.useState('');
  const [searched, setSearched] = React.useState(false);

  const handleSearch = () => {
    if (!city.trim()) return;
    setSearched(true);
    trackClick({ type: 'hotels-search', destination: city });
  };

  const isRu = lang === 'ru';

  return (
    <Stack spacing={2}>
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardHeader
          title={isRu ? '🏨 Поиск отелей' : '🏨 Hotel Search'}
          subheader={isRu
            ? 'Найди лучшие цены на отели через Hotellook'
            : 'Find the best hotel prices via Hotellook'}
          sx={{ pb: 0.5 }}
        />
        <CardContent sx={{ pt: 1.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              label={isRu ? 'Город' : 'City'}
              size="small"
              placeholder={isRu ? 'Нью-Йорк' : 'New York'}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
            />
            <TextField
              label={isRu ? 'Заезд' : 'Check-in'}
              type="date"
              size="small"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label={isRu ? 'Выезд' : 'Check-out'}
              type="date"
              size="small"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              size="small"
              sx={{ px: 3, borderRadius: 999, textTransform: 'none', minWidth: 120 }}
            >
              {isRu ? 'Найти' : 'Search'}
            </Button>
          </Stack>

          {searched && city.trim() && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                {isRu ? `Отели в ${city}` : `Hotels in ${city}`}
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<HotelIcon />}
                endIcon={<OpenInNewIcon />}
                href={hotellookLink(city, checkIn, checkOut)}
                target="_blank"
                rel="noopener"
                onClick={() => trackClick({ type: 'hotels-hotellook', destination: city })}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                {isRu ? `Найти отели на Hotellook` : `Find hotels on Hotellook`}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Popular destinations */}
      <Typography variant="h6" sx={{ mt: 1 }}>
        {isRu ? '🌍 Популярные направления' : '🌍 Popular Destinations'}
      </Typography>
      <Grid container spacing={2}>
        {POPULAR_DESTINATIONS.map((dest) => (
          <Grid item xs={12} sm={6} md={4} key={dest.city}>
            <DestinationCard dest={dest} checkIn={checkIn} checkOut={checkOut} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
