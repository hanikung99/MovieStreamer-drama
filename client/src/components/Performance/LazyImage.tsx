import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  className?: string;
  containerClassName?: string;
  blurDataURL?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder = '/images/placeholder.jpg',
  fallback = '/images/fallback.jpg',
  className,
  containerClassName,
  blurDataURL,
  priority = false,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const imageSrc = isError ? fallback : src;
  const shouldShowPlaceholder = !isLoaded && !isError;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-slate-100 dark:bg-slate-800',
        containerClassName
      )}
    >
      {/* Blur placeholder */}
      {shouldShowPlaceholder && blurDataURL && (
        <img
          src={blurDataURL}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover scale-110 blur-sm transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100',
            className
          )}
          aria-hidden="true"
        />
      )}

      {/* Loading placeholder */}
      {shouldShowPlaceholder && !blurDataURL && (
        <div
          className={cn(
            'absolute inset-0 w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 animate-pulse',
            className
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="text-center text-slate-500 dark:text-slate-400">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Progressive image component with multiple sizes
interface ProgressiveImageProps extends LazyImageProps {
  srcSet?: string;
  sizes?: string;
  webpSrc?: string;
  webpSrcSet?: string;
}

export function ProgressiveImage({
  src,
  srcSet,
  sizes,
  webpSrc,
  webpSrcSet,
  alt,
  className,
  ...props
}: ProgressiveImageProps) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={className}
      {...props}
      as="picture"
    >
      {/* WebP sources for better compression */}
      {webpSrc && (
        <source
          srcSet={webpSrcSet || webpSrc}
          sizes={sizes}
          type="image/webp"
        />
      )}
      
      {/* Fallback JPEG/PNG */}
      <source
        srcSet={srcSet || src}
        sizes={sizes}
        type="image/jpeg"
      />
    </LazyImage>
  );
}

// Movie poster with optimized loading
interface MoviePosterProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: 'poster' | 'landscape' | 'square';
}

export function MoviePoster({
  src,
  alt,
  title,
  className,
  priority = false,
  aspectRatio = 'poster'
}: MoviePosterProps) {
  const aspectRatioClasses = {
    poster: 'aspect-[2/3]', // 2:3 ratio for movie posters
    landscape: 'aspect-video', // 16:9 ratio
    square: 'aspect-square' // 1:1 ratio
  };

  // Generate different sizes for responsive loading
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [300, 600, 900, 1200];
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=75 ${size}w`)
      .join(', ');
  };

  const sizes = aspectRatio === 'poster' 
    ? '(max-width: 640px) 150px, (max-width: 768px) 200px, 250px'
    : '(max-width: 640px) 300px, (max-width: 768px) 400px, 500px';

  return (
    <div className={cn(aspectRatioClasses[aspectRatio], 'relative')}>
      <ProgressiveImage
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        webpSrc={src.replace(/\.(jpg|jpeg|png)$/, '.webp')}
        webpSrcSet={generateSrcSet(src.replace(/\.(jpg|jpeg|png)$/, '.webp'))}
        alt={alt}
        title={title}
        priority={priority}
        className={cn(
          'rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200',
          className
        )}
        placeholder="/images/movie-placeholder.jpg"
        fallback="/images/movie-fallback.jpg"
      />
    </div>
  );
}

// Avatar component with lazy loading
interface AvatarProps {
  src?: string;
  alt: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (!src) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold',
          sizeClasses[size],
          className
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
      containerClassName="rounded-full"
      fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`}
    />
  );
}
