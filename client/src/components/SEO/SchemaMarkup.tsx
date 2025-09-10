import React from 'react';

interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  videoUrl?: string;
  duration?: number;
  rating?: number;
  genre?: string[];
  director?: string;
  actors?: string[];
  releaseDate?: string;
  viewCount?: number;
}

interface SchemaMarkupProps {
  type: 'website' | 'movie' | 'videoObject' | 'organization' | 'breadcrumb';
  data?: any;
  movie?: Movie;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function SchemaMarkup({ type, data, movie, breadcrumbs }: SchemaMarkupProps) {
  const generateSchema = () => {
    const baseUrl = 'https://moviestreamer-drama.vercel.app';
    
    switch (type) {
      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'MovieStreamer',
          alternateName: 'MovieStreamer Drama',
          description: 'Mobile-first movie streaming platform with vertical videos and TikTok-style experience',
          url: baseUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          },
          publisher: {
            '@type': 'Organization',
            name: 'MovieStreamer',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/icons/icon-512x512.png`,
              width: 512,
              height: 512
            }
          },
          sameAs: [
            'https://twitter.com/moviestreamer',
            'https://facebook.com/moviestreamer',
            'https://instagram.com/moviestreamer'
          ]
        };

      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'MovieStreamer',
          alternateName: 'MovieStreamer Drama',
          description: 'Mobile-first movie streaming platform',
          url: baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/icons/icon-512x512.png`,
            width: 512,
            height: 512
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-555-MOVIES',
            contactType: 'Customer Service',
            availableLanguage: ['English', 'Vietnamese']
          },
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'US',
            addressRegion: 'CA',
            addressLocality: 'San Francisco'
          },
          foundingDate: '2024',
          numberOfEmployees: '10-50',
          industry: 'Entertainment Technology',
          keywords: 'movie streaming, mobile video, vertical videos, entertainment'
        };

      case 'movie':
        if (!movie) return null;
        return {
          '@context': 'https://schema.org',
          '@type': 'Movie',
          name: movie.title,
          description: movie.description,
          image: movie.posterUrl,
          url: `${baseUrl}/movie/${movie.id}`,
          datePublished: movie.releaseDate,
          genre: movie.genre,
          director: movie.director ? {
            '@type': 'Person',
            name: movie.director
          } : undefined,
          actor: movie.actors?.map(actor => ({
            '@type': 'Person',
            name: actor
          })),
          duration: movie.duration ? `PT${Math.floor(movie.duration / 60)}M${movie.duration % 60}S` : undefined,
          aggregateRating: movie.rating ? {
            '@type': 'AggregateRating',
            ratingValue: movie.rating,
            ratingCount: movie.viewCount || 100,
            bestRating: 5,
            worstRating: 1
          } : undefined,
          publisher: {
            '@type': 'Organization',
            name: 'MovieStreamer',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/icons/icon-512x512.png`
            }
          },
          potentialAction: {
            '@type': 'WatchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/movie/${movie.id}`,
              actionPlatform: [
                'https://schema.org/DesktopWebPlatform',
                'https://schema.org/MobileWebPlatform',
                'https://schema.org/IOSPlatform',
                'https://schema.org/AndroidPlatform'
              ]
            },
            expectsAcceptanceOf: {
              '@type': 'Offer',
              category: 'free',
              availability: 'https://schema.org/InStock'
            }
          }
        };

      case 'videoObject':
        if (!movie) return null;
        return {
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: movie.title,
          description: movie.description,
          thumbnailUrl: movie.posterUrl,
          contentUrl: movie.videoUrl,
          embedUrl: `${baseUrl}/embed/${movie.id}`,
          uploadDate: movie.releaseDate,
          duration: movie.duration ? `PT${Math.floor(movie.duration / 60)}M${movie.duration % 60}S` : undefined,
          width: movie.genre?.includes('vertical') ? '720' : '1920',
          height: movie.genre?.includes('vertical') ? '1280' : '1080',
          videoQuality: 'HD',
          encodingFormat: 'video/mp4',
          playerType: 'HTML5 Flash',
          requiresSubscription: false,
          isAccessibleForFree: true,
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/WatchAction',
            userInteractionCount: movie.viewCount || 0
          },
          publisher: {
            '@type': 'Organization',
            name: 'MovieStreamer',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/icons/icon-512x512.png`
            }
          }
        };

      case 'breadcrumb':
        if (!breadcrumbs) return null;
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: `${baseUrl}${crumb.url}`
          }))
        };

      default:
        return null;
    }
  };

  const schema = generateSchema();
  
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}

// Website Schema for homepage
export function WebsiteSchema() {
  return <SchemaMarkup type="website" />;
}

// Organization Schema
export function OrganizationSchema() {
  return <SchemaMarkup type="organization" />;
}

// Movie Schema
export function MovieSchema({ movie }: { movie: Movie }) {
  return (
    <>
      <SchemaMarkup type="movie" movie={movie} />
      <SchemaMarkup type="videoObject" movie={movie} />
    </>
  );
}

// Breadcrumb Schema
export function BreadcrumbSchema({ breadcrumbs }: { breadcrumbs: Array<{ name: string; url: string }> }) {
  return <SchemaMarkup type="breadcrumb" breadcrumbs={breadcrumbs} />;
}

// App Schema for PWA
export function AppSchema() {
  const baseUrl = 'https://moviestreamer-drama.vercel.app';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'MovieStreamer',
    applicationCategory: 'Entertainment',
    operatingSystem: 'All',
    description: 'Mobile-first movie streaming platform with vertical videos and TikTok-style experience',
    url: baseUrl,
    downloadUrl: baseUrl,
    installUrl: baseUrl,
    screenshot: [
      `${baseUrl}/screenshots/mobile-home.png`,
      `${baseUrl}/screenshots/mobile-player.png`,
      `${baseUrl}/screenshots/desktop-home.png`
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      ratingCount: 1250,
      bestRating: 5,
      worstRating: 1
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'free'
    },
    publisher: {
      '@type': 'Organization',
      name: 'MovieStreamer',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icons/icon-512x512.png`
      }
    },
    featureList: [
      'Offline viewing',
      'Push notifications',
      'Vertical video support',
      'Mobile-first design',
      'Progressive Web App',
      'Background sync',
      'Install prompts'
    ],
    requirements: 'Modern web browser with JavaScript enabled',
    memoryRequirements: '50MB',
    storageRequirements: '100MB',
    permissions: 'notifications, storage'
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}

// FAQ Schema
export function FAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is MovieStreamer free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, MovieStreamer is completely free to use. You can watch movies, series, and vertical shorts without any subscription or payment required.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I watch movies offline?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, MovieStreamer is a Progressive Web App (PWA) that caches content for offline viewing. You can watch previously loaded movies even without an internet connection.'
        }
      },
      {
        '@type': 'Question',
        name: 'What devices are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MovieStreamer works on all modern devices including smartphones, tablets, laptops, and desktops. It\'s optimized for mobile-first experience with special support for vertical videos.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do I install the app?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MovieStreamer can be installed as a Progressive Web App (PWA) directly from your browser. Look for the install prompt or use your browser\'s "Add to Home Screen" option.'
        }
      },
      {
        '@type': 'Question',
        name: 'What are vertical videos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vertical videos are short-form content optimized for mobile viewing in portrait mode, similar to TikTok or Instagram Reels. They provide an immersive mobile-first experience.'
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}
