import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from '@mui/material';

export default function AddTripDialog({ open, onClose, onSubmit }) {
  const [form, setForm] = React.useState({ from: '', to: '', date: '', price: '' });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = () => {
    const priceNum = Number(form.price);
    onSubmit({ ...form, price: priceNum });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Добавить поездку</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField name="from" label="From" value={form.from} onChange={handleChange} />
          <TextField name="to" label="To" value={form.to} onChange={handleChange} />
          <TextField name="date" label="Date" type="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField name="price" label="Price" type="number" value={form.price} onChange={handleChange} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave} variant="contained">Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
}
