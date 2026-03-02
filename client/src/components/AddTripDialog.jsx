import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from '@mui/material';
import { useI18n } from '../i18n';

export default function AddTripDialog({ open, onClose, onSubmit }) {
  const { t } = useI18n();
  const [form, setForm] = React.useState({ from: '', to: '', date: '', price: '' });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = () => {
    const priceNum = Number(form.price);
    onSubmit({ ...form, price: priceNum });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t.addTripTitle}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField name="from" label={t.from} value={form.from} onChange={handleChange} />
          <TextField name="to" label={t.to} value={form.to} onChange={handleChange} />
          <TextField name="date" label={t.date} type="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField name="price" label={t.price} type="number" value={form.price} onChange={handleChange} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t.cancel}</Button>
        <Button onClick={handleSave} variant="contained">{t.save}</Button>
      </DialogActions>
    </Dialog>
  );
}
