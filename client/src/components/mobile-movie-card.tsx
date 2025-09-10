import { useState } from "react";
import { Star, Play, Heart, Share, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMobileDevice } from "@/hooks/use-mobile";
import VerticalVideoPlayer from "./vertical-video-player";
import type { Movie } from "@shared/schema";

interface MobileMovieCardProps {
  movie: Movie;
  onClick?: () => void;
  onVideoPlay?: () => void;
  className?: string;
  variant?: "poster" | "vertical" | "horizontal";
  showVideoPlayer?: boolean;
  autoPlay?: boolean;
}

export default function MobileMovieCard({ 
  movie, 
  onClick, 
  onVideoPlay,
  className = "", 
  variant = "poster",
  showVideoPlayer = false,
  autoPlay = false
}: MobileMovieCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showVideo, setShowVideo] = useState(showVideoPlayer);
  const device = useMobileDevice();

  const handleVideoToggle = () => {
    setShowVideo(!showVideo);
    onVideoPlay?.();
  };

  const handleCardClick = () => {
    if (variant === "vertical" && device.isMobile) {
      handleVideoToggle();
    } else {
      onClick?.();
    }
  };

  // Vertical Video Card (TikTok/Instagram Reels style)
  if (variant === "vertical") {
    return (
      <Card 
        className={`
          relative bg-black rounded-mobile overflow-hidden cursor-pointer
          aspect-vertical w-full max-w-sm mx-auto
          shadow-mobile-lg transition-mobile hover:shadow-mobile
          ${className}
        `}
        onClick={handleCardClick}
        data-testid={`mobile-movie-card-vertical-${movie.id}`}
      >
        {showVideo ? (
          <VerticalVideoPlayer 
            movie={movie}
            autoPlay={autoPlay}
            muted={true}
            onVideoStart={onVideoPlay}
            className="rounded-mobile"
          />
        ) : (
          <>
            {/* Poster Image */}
            <div className="relative w-full h-full">
              <img 
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="lg"
                  className="touch-target-large bg-black/50 hover:bg-black/70 text-white rounded-full transition-mobile"
                  data-testid={`play-button-${movie.id}`}
                >
                  <Play className="h-8 w-8 ml-1" fill="currentColor" />
                </Button>
              </div>

              {/* Rating Badge */}
              <div className="absolute top-mobile-md right-mobile-md">
                <div className="bg-black/70 backdrop-blur-mobile px-mobile-sm py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3 text-primary fill-primary" />
                  <span className="text-xs text-white font-medium">
                    {movie.rating}
                  </span>
                </div>
              </div>

              {/* Side Actions */}
              <div className="absolute right-mobile-md bottom-20 flex flex-col gap-mobile-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                  className={`
                    touch-target-comfortable rounded-full backdrop-blur-mobile
                    ${isLiked ? 'bg-red-500/20 text-red-500' : 'bg-black/30 text-white'}
                    hover:bg-black/50 transition-mobile
                  `}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="touch-target-comfortable rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-mobile transition-mobile"
                >
                  <Share className="h-5 w-5" />
                </Button>
              </div>

              {/* Movie Info */}
              <div className="absolute bottom-0 left-0 right-0 p-mobile-md">
                <div className="text-white">
                  <h3 className="text-lg-mobile font-bold mb-1 line-clamp-2">
                    {movie.title}
                  </h3>
                  <p className="text-sm-mobile text-white/80 mb-2 line-clamp-2">
                    {movie.description}
                  </p>
                  <div className="flex items-center gap-mobile-sm text-xs-mobile text-white/70">
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.genre}</span>
                    <span>•</span>
                    <span>{movie.duration}m</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    );
  }

  // Horizontal Card (for lists)
  if (variant === "horizontal") {
    return (
      <Card 
        className={`
          flex bg-card rounded-mobile overflow-hidden cursor-pointer
          shadow-mobile transition-mobile hover:shadow-mobile-lg
          touch-manipulation ${className}
        `}
        onClick={onClick}
        data-testid={`mobile-movie-card-horizontal-${movie.id}`}
      >
        {/* Poster */}
        <div className="relative w-24 h-36 flex-shrink-0">
          <img 
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-1 right-1 bg-black/70 backdrop-blur px-1 py-0.5 rounded flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 text-primary fill-primary" />
            <span className="text-xs text-white font-medium">
              {movie.rating}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-mobile-md">
          <h3 className="text-base-mobile font-semibold mb-1 line-clamp-2">
            {movie.title}
          </h3>
          <p className="text-sm-mobile text-muted-foreground mb-2 line-clamp-2">
            {movie.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-mobile-sm text-xs-mobile text-muted-foreground">
              <span>{movie.year}</span>
              <span>•</span>
              <span>{movie.duration}m</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`
                touch-target p-1 rounded-full
                ${isLiked ? 'text-red-500' : 'text-muted-foreground'}
                hover:bg-accent transition-mobile
              `}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <div className="mt-2">
            <span className="text-xs bg-muted px-2 py-1 rounded-full">
              {movie.genre}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  // Default Poster Card (optimized for mobile)
  return (
    <Card 
      className={`
        bg-card rounded-mobile overflow-hidden cursor-pointer
        aspect-mobile-card w-full
        shadow-mobile transition-mobile hover:shadow-mobile-lg hover:scale-[1.02]
        touch-manipulation ${className}
      `}
      onClick={onClick}
      data-testid={`mobile-movie-card-${movie.id}`}
    >
      <div className="relative h-2/3">
        <img 
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Rating Badge */}
        <div className="absolute top-mobile-sm right-mobile-sm bg-black/70 backdrop-blur-mobile px-mobile-sm py-1 rounded-full flex items-center gap-1">
          <Star className="h-3 w-3 text-primary fill-primary" />
          <span className="text-xs text-white font-medium">
            {movie.rating}
          </span>
        </div>

        {/* Like Button */}
        <div className="absolute top-mobile-sm left-mobile-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`
              touch-target p-2 rounded-full backdrop-blur-mobile
              ${isLiked ? 'bg-red-500/20 text-red-500' : 'bg-black/30 text-white'}
              hover:bg-black/50 transition-mobile
            `}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-mobile-md h-1/3 flex flex-col justify-between">
        <div>
          <h3 className="text-base-mobile font-semibold mb-1 line-clamp-2">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between text-xs-mobile text-muted-foreground">
            <span>{movie.year}</span>
            <span className="bg-muted px-2 py-1 rounded-full">
              {movie.category === "series" && movie.episodes ? `${movie.episodes} tập` : `${movie.duration}m`}
            </span>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs-mobile text-muted-foreground line-clamp-1">
            {movie.genre}
          </p>
        </div>
      </div>
    </Card>
  );
}
