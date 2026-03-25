import * as React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, AppBar, Toolbar, Button, Stack, Box, Chip, Divider, Paper, Card, CardContent, Grid,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HotelIcon from '@mui/icons-material/Hotel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useI18n } from '../i18n';
import { getPost, BLOG_POSTS } from '../blog-data';
import { POPULAR_ROUTES } from '../routes-data';
import { trackClick } from '../api';
import SubscribeBlock from './SubscribeBlock';

// Generate Aviasales affiliate link with UTM
function getAviasalesLink(from, to, lang, placement = 'blog') {
  const baseUrl = 'https://www.aviasales.ru/search';
  const params = new URLSearchParams({
    from: from.toLowerCase(),
    to: to.toLowerCase(),
    utm_source: 'travelsearch.now',
    utm_medium: placement,
    utm_campaign: 'funnel_v1',
    marker: '681967',
  });
  return `${baseUrl}?${params.toString()}`;
}

// Get price for display
function getDisplayPrice(from, to) {
  const US_AIRPORTS = new Set(['JFK','LAX','SFO','ORD','ATL','DFW','MIA','BOS','SEA','DEN','IAH','EWR','PHX','SAN','PDX','MSP','DTW','PHL','CLT','LAS','MCO','BWI','SLC','RDU','AUS','TPA','HNL','STL','MCI','IND','CMH','CVG','BNA','PIT','MKE','JAX','OAK','SMF','SNA','BUR','ONT','SJC','ABQ','RNO','SAT','MEM','OKC','TUL','ORF','RIC','CHS']);
  const EUR_AIRPORTS = new Set(['LHR','CDG','FRA','AMS','FCO','MAD','BCN','MUC','ZRH','VIE','PRG','BUD','WAW','ATH','IST','DUB','CPH','OSL','ARN','HEL','LIS']);
  const ASIA_AIRPORTS = new Set(['NRT','HND','ICN','BKK','SIN','KUL','CGK','MNL','DEL','BOM','HAN','SGN','HKT']);
  
  const isUS = US_AIRPORTS.has(from) && US_AIRPORTS.has(to);
  const isUSEur = (US_AIRPORTS.has(from) && EUR_AIRPORTS.has(to)) || (US_AIRPORTS.has(to) && EUR_AIRPORTS.has(from));
  const isUSAsia = (US_AIRPORTS.has(from) && ASIA_AIRPORTS.has(to)) || (US_AIRPORTS.has(to) && ASIA_AIRPORTS.has(from));
  
  if (isUS) return Math.floor(89 + ((from.charCodeAt(0) + to.charCodeAt(0)) % 40));
  if (isUSEur) return Math.floor(349 + ((from.charCodeAt(0) + to.charCodeAt(0)) % 150));
  if (isUSAsia) return Math.floor(549 + ((from.charCodeAt(0) + to.charCodeAt(0)) % 200));
  return Math.floor(199 + ((from.charCodeAt(0) + to.charCodeAt(0)) % 100));
}

// Extract route from tags or title
function getRouteFromPost(post, isRu) {
  const title = isRu ? post.title_ru : post.title_en;
  const tags = post.tags || [];
  
  // Try to find matching route from POPULAR_ROUTES
  for (const route of POPULAR_ROUTES) {
    const fromCity = isRu ? route.fromCity_ru : route.fromCity_en;
    const toCity = isRu ? route.toCity_ru : route.toCity_en;
    if (title.toLowerCase().includes(fromCity.toLowerCase()) && title.toLowerCase().includes(toCity.toLowerCase())) {
      return route;
    }
  }
  
  // Try by tags
  for (const tag of tags) {
    for (const route of POPULAR_ROUTES) {
      const fromCity = isRu ? route.fromCity_ru : route.fromCity_en;
      const toCity = isRu ? route.toCity_ru : route.toCity_en;
      if (tag.toLowerCase().includes(fromCity.toLowerCase()) || tag.toLowerCase().includes(toCity.toLowerCase())) {
        return route;
      }
    }
  }
  
  return null;
}

// Get related routes for a post
function getRelatedRoutesForPost(post, isRu, count = 3) {
  const tags = post.tags || [];
  const routes = [];
  
  for (const route of POPULAR_ROUTES) {
    if (routes.length >= count) break;
    const fromCity = isRu ? route.fromCity_ru : route.fromCity_en;
    const toCity = isRu ? route.toCity_ru : route.toCity_en;
    
    for (const tag of tags) {
      if (tag.toLowerCase().includes(fromCity.toLowerCase()) || 
          tag.toLowerCase().includes(toCity.toLowerCase()) ||
          tag.toLowerCase().includes('flights')) {
        if (!routes.find(r => r.from === route.from && r.to === route.to)) {
          routes.push(route);
        }
        break;
      }
    }
  }
  
  // Fallback: return first N routes if no matches
  if (routes.length === 0) {
    return POPULAR_ROUTES.slice(0, count);
  }
  
  return routes;
}

const TP_MARKER = '681967';
const BOOKING_AID = '2709056';

function InlineCTA({ post, isRu, variant = 'primary' }) {
  const route = getRouteFromPost(post, isRu);
  
  if (variant === 'secondary') {
    // Compact version for 2nd CTA
    return (
      <Paper elevation={1} sx={{ my: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {isRu ? '✈️ Найдите лучшие цены на авиабилеты' : '✈️ Find the best flight prices'}
          </Typography>
          <Button
            variant="contained"
            size="small"
            endIcon={<OpenInNewIcon />}
            href={route ? getAviasalesLink(route.from, route.to, isRu ? 'ru' : 'en', 'blog_inline2') : '/'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick('aviasales', 'blog_inline2', route ? `${route.from}-${route.to}` : 'generic')}
            sx={{
              bgcolor: '#00C853',
              '&:hover': { bgcolor: '#00B548' },
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {isRu ? 'НАЙТИ →' : 'FIND →'}
          </Button>
        </Stack>
      </Paper>
    );
  }
  
  if (route) {
    const fromCity = isRu ? route.fromCity_ru : route.fromCity_en;
    const toCity = isRu ? route.toCity_ru : route.toCity_en;
    const price = getDisplayPrice(route.from, route.to);
    
    return (
      <Paper elevation={2} sx={{ my: 3, p: 3, bgcolor: '#f8f9fa', borderLeft: '4px solid #FF6B00' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <LocalOfferIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {isRu ? `💡 Ищете билеты ${fromCity} → ${toCity}?` : `💡 Looking for flights ${fromCity} → ${toCity}?`}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {isRu 
                ? `Сравните цены на Aviasales — найдено от $${price}`
                : `Compare prices on Aviasales — found from $${price}`}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            endIcon={<OpenInNewIcon />}
            href={getAviasalesLink(route.from, route.to, isRu ? 'ru' : 'en', 'blog_inline')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick('aviasales', 'blog_inline', `${route.from}-${route.to}`)}
            sx={{
              bgcolor: '#FF6B00',
              '&:hover': { bgcolor: '#E55A00' },
              px: 4,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {isRu ? 'СРАВНИТЬ ЦЕНЫ →' : 'COMPARE PRICES →'}
          </Button>
        </Stack>
      </Paper>
    );
  }
  
  // Generic CTA if no route found
  return (
    <Paper elevation={2} sx={{ my: 3, p: 3, bgcolor: '#f8f9fa', borderLeft: '4px solid #FF6B00' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {isRu ? '💡 Ищете дешёвые авиабилеты?' : '💡 Looking for cheap flights?'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isRu 
              ? 'Сравните цены на 200+ направлений через Aviasales'
              : 'Compare prices on 200+ routes via Aviasales'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/"
          sx={{
            bgcolor: '#FF6B00',
            '&:hover': { bgcolor: '#E55A00' },
            px: 4,
            fontWeight: 600,
          }}
        >
          {isRu ? 'НАЙТИ БИЛЕТЫ →' : 'FIND FLIGHTS →'}
        </Button>
      </Stack>
    </Paper>
  );
}

function EndCTA({ post, isRu }) {
  const routes = getRelatedRoutesForPost(post, isRu, 3);
  
  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {isRu ? '✈️ Нашли полезным? Посмотрите билеты по этому направлению:' : '✈️ Found this helpful? Check flights for this route:'}
      </Typography>
      <Grid container spacing={2}>
        {routes.map((route) => {
          const fromCity = isRu ? route.fromCity_ru : route.fromCity_en;
          const toCity = isRu ? route.toCity_ru : route.toCity_en;
          const price = getDisplayPrice(route.from, route.to);
          
          return (
            <Grid item xs={12} sm={4} key={`${route.from}-${route.to}`}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {fromCity} → {toCity}
                  </Typography>
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
                    ${price}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    href={getAviasalesLink(route.from, route.to, isRu ? 'ru' : 'en', 'blog_end')}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNewIcon />}
                    onClick={() => trackClick('aviasales', 'blog_end', `${route.from}-${route.to}`)}
                    sx={{ bgcolor: '#00C853', '&:hover': { bgcolor: '#00B548' } }}
                  >
                    {isRu ? 'Смотреть' : 'View'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

function ContentRenderer({ content, lang, post, isRu }) {
  let paragraphCount = 0;
  const elements = [];
  
  content.forEach((block, i) => {
    switch (block.type) {
      case 'h2':
        elements.push(<Typography key={i} variant="h5" component="h2" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>{block.text}</Typography>);
        break;
      case 'p':
        paragraphCount++;
        elements.push(<Typography key={i} variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>{block.text}</Typography>);
        // Insert inline CTA after 3rd paragraph
        if (paragraphCount === 3) {
          elements.push(<InlineCTA key={`cta-${i}`} post={post} isRu={isRu} />);
        }
        // Insert second CTA after 6th paragraph (for long articles)
        if (paragraphCount === 6) {
          elements.push(<InlineCTA key={`cta2-${i}`} post={post} isRu={isRu} variant="secondary" />);
        }
        break;
      case 'ul':
        elements.push(
          <Box key={i} component="ul" sx={{ mb: 2, pl: 2 }}>
            {block.items.map((item, j) => (
              <li key={j}><Typography variant="body1" sx={{ lineHeight: 1.8 }}>{item}</Typography></li>
            ))}
          </Box>
        );
        break;
      case 'cta':
        elements.push(
          <Button key={i} component={RouterLink} to={block.link} variant="contained" size="small"
            startIcon={<FlightTakeoffIcon />}
            sx={{ mb: 2, textTransform: 'none', borderRadius: 999 }}>
            {block.text}
          </Button>
        );
        break;
      case 'cta-hotel': {
        const link = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(block.city)}&aid=${BOOKING_AID}`;
        elements.push(
          <Button key={i} href={link} target="_blank" rel="noopener" variant="outlined" size="small"
            startIcon={<HotelIcon />} endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            onClick={() => trackClick({ type: 'hotels', destination: block.city })}
            sx={{ mb: 2, textTransform: 'none', borderRadius: 999 }}>
            {block.text}
          </Button>
        );
        break;
      }
      default:
        break;
    }
  });
  
  return elements;
}

export default function BlogPost() {
  const { slug, lang: urlLang } = useParams();
  const { lang } = useI18n();
  const effectiveLang = (urlLang === 'ru' || urlLang === 'en') ? urlLang : lang;
  const isRu = effectiveLang === 'ru';
  const post = getPost(slug);

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4">404</Typography>
        <Typography>{isRu ? 'Статья не найдена' : 'Post not found'}</Typography>
        <Button component={RouterLink} to={`/${effectiveLang}/blog`} sx={{ mt: 2 }}>
          {isRu ? 'Все статьи' : 'All posts'}
        </Button>
      </Container>
    );
  }

  const title = isRu ? post.title_ru : post.title_en;
  const desc = isRu ? post.desc_ru : post.desc_en;
  const content = isRu ? post.content_ru : post.content_en;
  const otherLang = isRu ? 'en' : 'ru';

  return (
    <>
      <Helmet>
        <title>{title} | Travel Search App</title>
        <meta name="description" content={desc} />
        <html lang={effectiveLang} />
        <link rel="canonical" href={`https://travelsearch.now/${effectiveLang}/blog/${slug}`} />
        <link rel="alternate" hrefLang={effectiveLang} href={`https://travelsearch.now/${effectiveLang}/blog/${slug}`} />
        <link rel="alternate" hrefLang={otherLang} href={`https://travelsearch.now/${otherLang}/blog/${slug}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://travelsearch.now/${effectiveLang}/blog/${slug}`} />
      </Helmet>

      <AppBar position="sticky" color="default" elevation={0}
        sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
        <Toolbar>
          <FlightTakeoffIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component={RouterLink} to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            Travel Search App
          </Typography>
          <Button component={RouterLink} to={`/${effectiveLang}/blog`} startIcon={<ArrowBackIcon />} size="small">
            {isRu ? 'Блог' : 'Blog'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          {post.image} {title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip label={post.date} size="small" variant="outlined" />
          {post.tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}
        </Stack>

        <ContentRenderer content={content} lang={effectiveLang} post={post} isRu={isRu} />

        {/* End CTA with related routes */}
        <EndCTA post={post} isRu={isRu} />

        {/* Subscribe block */}
        <SubscribeBlock />

        {/* Related posts */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          {isRu ? '📚 Другие статьи' : '📚 More Articles'}
        </Typography>
        <Stack spacing={1}>
          {BLOG_POSTS.filter((p) => p.slug !== slug).map((p) => (
            <Button key={p.slug} component={RouterLink} to={`/${effectiveLang}/blog/${p.slug}`}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', textAlign: 'left' }}>
              {p.image} {isRu ? p.title_ru : p.title_en}
            </Button>
          ))}
        </Stack>
      </Container>

      {/* FLOATING CTA BUTTON — Mobile only */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          display: { xs: 'block', sm: 'none' },
        }}
      >
        <Button
          variant="contained"
          size="large"
          href={(() => {
            const route = getRouteFromPost(post, isRu);
            return route 
              ? getAviasalesLink(route.from, route.to, isRu ? 'ru' : 'en', 'blog_floating')
              : '/';
          })()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            const route = getRouteFromPost(post, isRu);
            trackClick('aviasales', 'blog_floating', route ? `${route.from}-${route.to}` : 'generic');
          }}
          sx={{
            bgcolor: '#FF6B00',
            '&:hover': { bgcolor: '#E55A00' },
            borderRadius: 999,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(255, 107, 0, 0.4)',
          }}
        >
          {isRu ? '✈️ Найти билет' : '✈️ Find flights'}
        </Button>
      </Box>
    </>
  );
}
