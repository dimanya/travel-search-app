import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import FlightLanding from './components/FlightLanding';
import RoutesIndex from './components/RoutesIndex';
import LangWrapper from './components/LangWrapper';
import { I18nProvider } from './i18n';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#ff9800' },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
});

function detectLang() {
  const saved = localStorage.getItem('lang');
  if (saved === 'ru' || saved === 'en') return saved;
  const browser = navigator.language?.slice(0, 2);
  return browser === 'ru' ? 'ru' : 'en';
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <I18nProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />

              {/* Language-prefixed flight routes */}
              <Route path="/:lang/flights" element={<LangWrapper><RoutesIndex /></LangWrapper>} />
              <Route path="/:lang/flights/:route" element={<LangWrapper><FlightLanding /></LangWrapper>} />

              {/* Legacy /flights redirects to detected lang */}
              <Route path="/flights" element={<Navigate to={`/${detectLang()}/flights`} replace />} />
              <Route path="/flights/:route" element={<LegacyRedirect />} />
            </Routes>
          </BrowserRouter>
        </I18nProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);

function LegacyRedirect() {
  const route = window.location.pathname.split('/flights/')[1] || '';
  return <Navigate to={`/${detectLang()}/flights/${route}`} replace />;
}
