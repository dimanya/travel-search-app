import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000',
});

/**
 * Track affiliate link clicks.
 * type: 'flights' | 'hotels' | 'maps'
 */
export function trackClick({ type, destination, origin, price }) {
  api
    .post('/api/track-click', {
      type,
      destination,
      origin,
      price,
      timestamp: new Date().toISOString(),
    })
    .catch(() => {}); // fire-and-forget
}
