import * as React from 'react'
import { Container, Typography, Stack, TextField, Button, CircularProgress } from '@mui/material'
import TripsTable from './components/TripsTable'
import AddTripDialog from './components/AddTripDialog'
import { api } from './api'

export default function App() {
  const [rows, setRows] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [filters, setFilters] = React.useState({ from: '', to: '' })
  const [openAdd, setOpenAdd] = React.useState(false)

  const fetchTrips = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to
      const { data } = await api.get('/api/trips', { params })
      setRows(data)
    } catch (e) {
      console.error(e)
      alert('Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchTrips() }, [])

  const handleAdd = async (trip) => {
    try {
      setLoading(true)
      const { data } = await api.post('/api/trips', trip)
      setRows((r) => [...r, data])
      setOpenAdd(false)
    } catch (e) {
      console.error(e)
      alert('Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Travel Search App</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField label="From" value={filters.from} onChange={(e) => setFilters(f => ({ ...f, from: e.target.value }))} />
        <TextField label="To" value={filters.to} onChange={(e) => setFilters(f => ({ ...f, to: e.target.value }))} />
        <Button variant="contained" onClick={fetchTrips}>Поиск</Button>
        <Button variant="outlined" onClick={() => setOpenAdd(true)}>Добавить</Button>
      </Stack>

      {loading ? <CircularProgress /> : <TripsTable rows={rows} />}

      <AddTripDialog open={openAdd} onClose={() => setOpenAdd(false)} onSubmit={handleAdd} />
    </Container>
  )
}
