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
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { trackClick } from '../api';
import { useI18n } from '../i18n';

export default function TripsTable({ rows }) {
  const { t } = useI18n();

  const handleBuy = (row) => {
    trackClick({
      type: 'flights',
      origin: row.from,
      destination: row.to,
      price: row.price,
    });
  };

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
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                {t.noResults}
              </TableCell>
            </TableRow>
          )}
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
                {r.link ? (
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
                ) : (
                  <Chip label={t.demo} size="small" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
