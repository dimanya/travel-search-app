import * as React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, AppBar, Toolbar, Button, Stack, Box, Chip, Divider,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HotelIcon from '@mui/icons-material/Hotel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useI18n } from '../i18n';
import { getPost, BLOG_POSTS } from '../blog-data';
import { trackClick } from '../api';
import SubscribeBlock from './SubscribeBlock';

const TP_MARKER = '681967';
const BOOKING_AID = '2709056';

function ContentRenderer({ content, lang }) {
  return content.map((block, i) => {
    switch (block.type) {
      case 'h2':
        return <Typography key={i} variant="h5" component="h2" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>{block.text}</Typography>;
      case 'p':
        return <Typography key={i} variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>{block.text}</Typography>;
      case 'ul':
        return (
          <Box key={i} component="ul" sx={{ mb: 2, pl: 2 }}>
            {block.items.map((item, j) => (
              <li key={j}><Typography variant="body1" sx={{ lineHeight: 1.8 }}>{item}</Typography></li>
            ))}
          </Box>
        );
      case 'cta':
        return (
          <Button key={i} component={RouterLink} to={block.link} variant="contained" size="small"
            startIcon={<FlightTakeoffIcon />}
            sx={{ mb: 2, textTransform: 'none', borderRadius: 999 }}>
            {block.text}
          </Button>
        );
      case 'cta-hotel': {
        const link = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(block.city)}&aid=${BOOKING_AID}`;
        return (
          <Button key={i} href={link} target="_blank" rel="noopener" variant="outlined" size="small"
            startIcon={<HotelIcon />} endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            onClick={() => trackClick({ type: 'hotels', destination: block.city })}
            sx={{ mb: 2, textTransform: 'none', borderRadius: 999 }}>
            {block.text}
          </Button>
        );
      }
      default:
        return null;
    }
  });
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

        <ContentRenderer content={content} lang={effectiveLang} />

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
    </>
  );
}
