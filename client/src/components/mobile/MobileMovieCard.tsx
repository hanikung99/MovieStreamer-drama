import React, { useState } from 'react';
import { Play, Heart, Star, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Movie } from '@shared/schema';

interface MobileMovieCardProps {
  movie: Movie;
  variant?: 'default' | 'compact' | 'featured';
  onPlay?: (movie: Movie) => void;
  onFavorite?: (movieId: string) => void;
  className?: string;
}

export function MobileMovieCard({
  movie,
  variant = 'default',
  onPlay,
  onFavorite,
  className
}: MobileMovieCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onFavorite?.(movie.id);
  };

  const handlePlay = () => {
    onPlay?.(movie);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatViewCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          "flex gap-3 p-3 bg-card rounded-lg border border-border/50 active:scale-95 transition-transform",
          className
        )}
        onClick={handlePlay}
      >
        {/* Poster */}
        <div className="relative flex-shrink-0 w-20 h-28 rounded-md overflow-hidden bg-muted">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20 animate-pulse" />
          )}
          <img
            src={movie.verticalPosterUrl || movie.posterUrl}
            alt={movie.title}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20" />
          <Button
            size="icon"
            variant="ghost"
            className="absolute inset-0 w-full h-full bg-black/30 hover:bg-black/50 text-white border-0"
          >
            <Play className="w-4 h-4 fill-current" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {movie.description}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{movie.rating}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(movie.duration)}</span>
            </div>
            {movie.viewCount && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViewCount(movie.viewCount)}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {movie.category === 'movie' ? 'Phim lẻ' : 
               movie.category === 'series' ? 'Phim bộ' : 'Phim ngắn'}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="w-6 h-6 p-0"
              onClick={handleFavorite}
            >
              <Heart 
                className={cn(
                  "w-4 h-4",
                  isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )} 
              />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div 
        className={cn(
          "relative w-full h-48 rounded-xl overflow-hidden bg-muted active:scale-95 transition-transform",
          className
        )}
        onClick={handlePlay}
      >
        {/* Background Image */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20 animate-pulse" />
        )}
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg line-clamp-2 mb-1">
                {movie.title}
              </h3>
              <p className="text-white/80 text-sm line-clamp-2 mb-2">
                {movie.description}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="ml-2 text-white hover:bg-white/20"
              onClick={handleFavorite}
            >
              <Heart 
                className={cn(
                  "w-5 h-5",
                  isLiked ? "fill-red-500 text-red-500" : "text-white"
                )} 
              />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{movie.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
              {movie.viewCount && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViewCount(movie.viewCount)}</span>
                </div>
              )}
            </div>
            
            <Button
              size="sm"
              className="bg-white text-black hover:bg-white/90"
            >
              <Play className="w-4 h-4 mr-1 fill-current" />
              Xem
            </Button>
          </div>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="icon"
            variant="ghost"
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className={cn(
        "relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-muted active:scale-95 transition-transform",
        className
      )}
      onClick={handlePlay}
    >
      {/* Poster Image */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20 animate-pulse" />
      )}
      <img
        src={movie.verticalPosterUrl || movie.posterUrl}
        alt={movie.title}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setImageLoaded(true)}
        loading="lazy"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Favorite Button */}
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 w-8 h-8 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white border-0"
        onClick={handleFavorite}
      >
        <Heart 
          className={cn(
            "w-4 h-4",
            isLiked ? "fill-red-500 text-red-500" : "text-white"
          )} 
        />
      </Button>

      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          size="icon"
          variant="ghost"
          className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white border-0"
        >
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </Button>
      </div>

      {/* Movie Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
          {movie.title}
        </h3>
        
        <div className="flex items-center gap-2 text-white/80 text-xs">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{movie.rating}</span>
          </div>
          <span>•</span>
          <span>{movie.year}</span>
          {movie.viewCount && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{formatViewCount(movie.viewCount)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quality Badge */}
      {movie.videoQuality && (
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 text-xs bg-black/50 text-white border-0"
        >
          {movie.videoQuality}
        </Badge>
      )}
    </div>
  );
}
