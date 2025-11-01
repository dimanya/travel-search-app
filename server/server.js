import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());

let trips = [
  { id: 1, from: 'LAX', to: 'JFK', date: '2025-11-05', price: 199 },
  { id: 2, from: 'SFO', to: 'SEA', date: '2025-11-10', price: 89 }
];

app.get('/api/trips', (req, res) => {
  const { from, to } = req.query;
  let result = trips;
  if (from) result = result.filter(t => t.from.toLowerCase() === String(from).toLowerCase());
  if (to)   result = result.filter(t => t.to.toLowerCase() === String(to).toLowerCase());
  res.json(result);
});

app.post('/api/trips', (req, res) => {
  const { from, to, date, price } = req.body || {};
  if (!from || !to || !date || typeof price !== 'number') {
    return res.status(400).json({ error: 'from, to, date, price (number) обязательны' });
  }
  const id = trips.length ? Math.max(...trips.map(t => t.id)) + 1 : 1;
  const trip = { id, from, to, date, price };
  trips.push(trip);
  res.status(201).json(trip);
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
