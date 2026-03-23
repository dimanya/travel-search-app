import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { trackClick } from '../api';
import { useI18n } from '../i18n';

function MobileCard({ row, t, onBuy }) {
  return (
    <Card variant="outlined" sx={{ mb: 1.5 }}>
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {row.from} → {row.to}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            ${row.price}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {row.date}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            · {row.airline || '—'}
          </Typography>
          {typeof row.transfers === 'number' && (
            row.transfers === 0 ? (
              <Chip label={t.direct} size="small" color="success" variant="outlined" />
            ) : (
              <Chip label={`${row.transfers} ${t.transfers}`} size="small" variant="outlined" />
            )
          )}
        </Stack>

        {row.link && (
          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={<FlightTakeoffIcon />}
            href={row.link}
            target="_blank"
            rel="noopener"
            onClick={() => onBuy(row)}
            sx={{ textTransform: 'none', borderRadius: 999 }}
          >
            {t.buy}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function TripsTable({ rows }) {
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleBuy = (row) => {
    trackClick({
      type: 'flights',
      origin: row.from,
      destination: row.to,
      price: row.price,
    });
  };

  if (rows.length === 0) {
    return (
      <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
        {t.noResults}
      </Typography>
    );
  }

  if (isMobile) {
    return (
      <Box>
        {rows.map((r) => (
          <MobileCard key={r.id} row={r} t={t} onBuy={handleBuy} />
        ))}
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t.from}</TableCell>
            <TableCell>{t.to}</TableCell>
            <TableCell>{t.date}</TableCell>
            <TableCell>{t.airline}</TableCell>
            <TableCell align="center">{t.transfersCol}</TableCell>
            <TableCell align="right">{t.price}</TableCell>
            <TableCell align="center" />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell>{r.from}</TableCell>
              <TableCell>{r.to}</TableCell>
              <TableCell>{r.date}</TableCell>
              <TableCell>{r.airline || '—'}</TableCell>
              <TableCell align="center">
                {typeof r.transfers === 'number' ? (
                  r.transfers === 0 ? (
                    <Chip label={t.direct} size="small" color="success" variant="outlined" />
                  ) : (
                    <Chip label={`${r.transfers} ${t.transfers}`} size="small" variant="outlined" />
                  )
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                ${r.price}
              </TableCell>
              <TableCell align="center">
                {r.link && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<FlightTakeoffIcon />}
                    href={r.link}
                    target="_blank"
                    rel="noopener"
                    onClick={() => handleBuy(r)}
                    sx={{ textTransform: 'none', borderRadius: 999 }}
                  >
                    {t.buy}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
