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

export default function TripsTable({ rows }) {
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
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Airline</TableCell>
            <TableCell align="center">Transfers</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="center" />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                Нет результатов. Попробуй изменить фильтры.
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
                    <Chip label="Прямой" size="small" color="success" variant="outlined" />
                  ) : (
                    <Chip label={`${r.transfers} пер.`} size="small" variant="outlined" />
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
                    Купить
                  </Button>
                ) : (
                  <Chip label="Demo" size="small" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
