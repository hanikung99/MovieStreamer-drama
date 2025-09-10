// SEO utilities for MovieStreamer
export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video.movie' | 'video.other';
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface MovieSEO {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  genre?: string[];
  director?: string;
  actors?: string[];
  releaseDate?: string;
  duration?: number;
  rating?: number;
  viewCount?: number;
}

const BASE_URL = 'https://moviestreamer-drama.vercel.app';
const SITE_NAME = 'MovieStreamer';
const DEFAULT_IMAGE = `${BASE_URL}/icons/icon-512x512.png`;

// Generate SEO data for different page types
export function generateSEO(data: Partial<SEOData>): SEOData {
  const defaultData: SEOData = {
    title: 'MovieStreamer - Mobile Cinema Experience',
    description: 'Mobile-first movie streaming platform with vertical videos and TikTok-style experience. Watch movies, series, and shorts optimized for mobile devices.',
    keywords: 'movies, streaming, mobile, vertical videos, cinema, entertainment, TikTok-style, PWA',
    image: DEFAULT_IMAGE,
    url: BASE_URL,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    author: 'MovieStreamer Team'
  };

  return {
    ...defaultData,
    ...data,
    url: data.url ? `${BASE_URL}${data.url}` : defaultData.url
  };
}

// Generate SEO for homepage
export function getHomepageSEO(): SEOData {
  return generateSEO({
    title: 'MovieStreamer - Mobile Cinema Experience | Watch Movies & Vertical Videos',
    description: 'Discover the future of mobile entertainment with MovieStreamer. Watch movies, series, and TikTok-style vertical videos optimized for your mobile device. Free streaming with offline support.',
    keywords: 'movie streaming, mobile movies, vertical videos, TikTok-style videos, free streaming, PWA, offline movies, mobile cinema',
    url: '/',
    type: 'website'
  });
}

// Generate SEO for movie pages
export function getMovieSEO(movie: MovieSEO): SEOData {
  const genreText = movie.genre?.join(', ') || 'Movie';
  const actorsText = movie.actors?.slice(0, 3).join(', ') || '';
  const ratingText = movie.rating ? ` Rated ${movie.rating}/5 stars.` : '';
  const viewsText = movie.viewCount ? ` Watched by ${movie.viewCount.toLocaleString()} viewers.` : '';
  
  return generateSEO({
    title: `${movie.title} - Watch Online | ${genreText} Movie | MovieStreamer`,
    description: `Watch ${movie.title} online for free on MovieStreamer. ${movie.description}${ratingText}${viewsText} Starring ${actorsText}. Mobile-optimized streaming experience.`,
    keywords: `${movie.title}, watch online, ${movie.genre?.join(', ')}, ${movie.director}, ${actorsText}, free movie streaming, mobile movies`,
    image: movie.posterUrl,
    url: `/movie/${movie.id}`,
    type: 'video.movie',
    publishedTime: movie.releaseDate,
    section: 'Movies',
    tags: movie.genre
  });
}

// Generate SEO for vertical video/shorts pages
export function getShortSEO(short: MovieSEO): SEOData {
  return generateSEO({
    title: `${short.title} - Vertical Video Short | Mobile-Optimized | MovieStreamer`,
    description: `Watch ${short.title} - a mobile-optimized vertical video short. ${short.description} Perfect for TikTok-style mobile viewing experience.`,
    keywords: `${short.title}, vertical video, mobile video, short video, TikTok-style, mobile streaming, ${short.genre?.join(', ')}`,
    image: short.posterUrl,
    url: `/short/${short.id}`,
    type: 'video.other',
    publishedTime: short.releaseDate,
    section: 'Shorts',
    tags: [...(short.genre || []), 'vertical', 'mobile', 'short']
  });
}

// Generate SEO for category pages
export function getCategorySEO(category: string): SEOData {
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  
  return generateSEO({
    title: `${categoryTitle} Movies - Stream Online | MovieStreamer`,
    description: `Discover the best ${category} movies on MovieStreamer. Stream ${category} films optimized for mobile viewing with offline support and vertical video options.`,
    keywords: `${category} movies, ${category} films, stream ${category}, mobile ${category} movies, free ${category} streaming`,
    url: `/category/${category}`,
    type: 'website',
    section: 'Categories'
  });
}

// Generate SEO for genre pages
export function getGenreSEO(genre: string): SEOData {
  const genreTitle = genre.charAt(0).toUpperCase() + genre.slice(1);
  
  return generateSEO({
    title: `${genreTitle} Genre Movies & Videos | MovieStreamer`,
    description: `Explore ${genre} movies and videos on MovieStreamer. Mobile-first streaming platform with ${genre} content optimized for all devices.`,
    keywords: `${genre} movies, ${genre} videos, ${genre} streaming, mobile ${genre}, free ${genre} movies`,
    url: `/genre/${genre}`,
    type: 'website',
    section: 'Genres'
  });
}

// Generate SEO for search pages
export function getSearchSEO(query?: string): SEOData {
  const title = query 
    ? `Search Results for "${query}" | MovieStreamer`
    : 'Search Movies & Videos | MovieStreamer';
    
  const description = query
    ? `Find movies and videos related to "${query}" on MovieStreamer. Mobile-optimized search results with instant streaming.`
    : 'Search through thousands of movies, series, and vertical videos on MovieStreamer. Mobile-first search experience with instant results.';

  return generateSEO({
    title,
    description,
    keywords: query ? `${query}, search movies, find videos, ${query} streaming` : 'search movies, find videos, movie search, video search',
    url: query ? `/search?q=${encodeURIComponent(query)}` : '/search',
    type: 'website',
    section: 'Search'
  });
}

// Generate SEO for favorites page
export function getFavoritesSEO(): SEOData {
  return generateSEO({
    title: 'My Favorites - Saved Movies & Videos | MovieStreamer',
    description: 'Access your favorite movies and videos on MovieStreamer. Personalized collection of saved content available offline on your mobile device.',
    keywords: 'favorite movies, saved videos, my favorites, personal collection, offline movies, mobile favorites',
    url: '/favorites',
    type: 'website',
    section: 'Favorites'
  });
}

// Generate meta tags for HTML head
export function generateMetaTags(seo: SEOData): string {
  const tags = [
    // Basic meta tags
    `<title>${seo.title}</title>`,
    `<meta name="description" content="${seo.description}" />`,
    seo.keywords && `<meta name="keywords" content="${seo.keywords}" />`,
    seo.author && `<meta name="author" content="${seo.author}" />`,
    
    // Open Graph tags
    `<meta property="og:title" content="${seo.title}" />`,
    `<meta property="og:description" content="${seo.description}" />`,
    `<meta property="og:type" content="${seo.type}" />`,
    `<meta property="og:url" content="${seo.url}" />`,
    `<meta property="og:image" content="${seo.image}" />`,
    seo.siteName && `<meta property="og:site_name" content="${seo.siteName}" />`,
    seo.locale && `<meta property="og:locale" content="${seo.locale}" />`,
    seo.publishedTime && `<meta property="article:published_time" content="${seo.publishedTime}" />`,
    seo.modifiedTime && `<meta property="article:modified_time" content="${seo.modifiedTime}" />`,
    seo.section && `<meta property="article:section" content="${seo.section}" />`,
    seo.tags && seo.tags.map(tag => `<meta property="article:tag" content="${tag}" />`).join('\n'),
    
    // Twitter Card tags
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${seo.title}" />`,
    `<meta name="twitter:description" content="${seo.description}" />`,
    `<meta name="twitter:image" content="${seo.image}" />`,
    
    // Additional meta tags
    `<link rel="canonical" href="${seo.url}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<meta name="googlebot" content="index, follow" />`,
    `<meta name="bingbot" content="index, follow" />`
  ];

  return tags.filter(Boolean).join('\n');
}

// Generate JSON-LD structured data
export function generateJSONLD(type: string, data: any): string {
  const baseUrl = BASE_URL;
  
  let schema: any = {
    '@context': 'https://schema.org'
  };

  switch (type) {
    case 'website':
      schema = {
        ...schema,
        '@type': 'WebSite',
        name: SITE_NAME,
        url: baseUrl,
        description: data.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };
      break;

    case 'movie':
      schema = {
        ...schema,
        '@type': 'Movie',
        name: data.title,
        description: data.description,
        image: data.image,
        url: data.url,
        genre: data.genre,
        datePublished: data.releaseDate,
        aggregateRating: data.rating && {
          '@type': 'AggregateRating',
          ratingValue: data.rating,
          bestRating: 5,
          worstRating: 1,
          ratingCount: data.viewCount || 100
        }
      };
      break;

    case 'breadcrumb':
      schema = {
        ...schema,
        '@type': 'BreadcrumbList',
        itemListElement: data.breadcrumbs.map((crumb: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: `${baseUrl}${crumb.url}`
        }))
      };
      break;
  }

  return JSON.stringify(schema, null, 2);
}

// Utility to clean and optimize text for SEO
export function optimizeTextForSEO(text: string, maxLength: number = 160): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .substring(0, maxLength)
    .replace(/\.$/, '') // Remove trailing period if exists
    + (text.length > maxLength ? '...' : '');
}

// Generate keywords from text
export function generateKeywords(text: string, additionalKeywords: string[] = []): string {
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10);

  return [...new Set([...words, ...additionalKeywords])].join(', ');
}
