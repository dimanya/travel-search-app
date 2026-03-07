import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, AppBar, Toolbar, Button, Card, CardContent,
  CardActionArea, Stack, Chip, Box,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useI18n } from '../i18n';
import { BLOG_POSTS } from '../blog-data';

export default function BlogIndex() {
  const { lang } = useI18n();
  const isRu = lang === 'ru';

  const title = isRu
    ? 'Блог о путешествиях — советы и дешёвые билеты | Travel Search App'
    : 'Travel Blog — tips and cheap flights | Travel Search App';
  const desc = isRu
    ? 'Полезные статьи о путешествиях: как найти дешёвые билеты, лучшие направления, советы по экономии.'
    : 'Useful travel articles: how to find cheap flights, best destinations, money-saving tips.';

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`https://travelsearch.now/${lang}/blog`} />
      </Helmet>

      <AppBar position="sticky" color="default" elevation={0}
        sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
        <Toolbar>
          <FlightTakeoffIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component={RouterLink} to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            Travel Search App
          </Typography>
          <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} size="small">
            {isRu ? 'Главная' : 'Home'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
          {isRu ? '📝 Блог о путешествиях' : '📝 Travel Blog'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {desc}
        </Typography>

        <Stack spacing={3}>
          {BLOG_POSTS.map((post) => (
            <Card key={post.slug} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardActionArea component={RouterLink} to={`/${lang}/blog/${post.slug}`}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Typography variant="h3" sx={{ lineHeight: 1 }}>{post.image}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {isRu ? post.title_ru : post.title_en}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {isRu ? post.desc_ru : post.desc_en}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={post.date} size="small" variant="outlined" />
                        {post.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      </Container>
    </>
  );
}
