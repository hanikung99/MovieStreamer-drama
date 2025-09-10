import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Heart, Share2, MessageCircle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Movie } from '@shared/schema';

interface VerticalVideoPlayerProps {
  movie: Movie;
  isActive: boolean;
  onLike?: (movieId: string) => void;
  onShare?: (movieId: string) => void;
  onComment?: (movieId: string) => void;
  className?: string;
}

export function VerticalVideoPlayer({
  movie,
  isActive,
  onLike,
  onShare,
  onComment,
  className
}: VerticalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [touchStartY, setTouchStartY] = useState(0);

  // Auto-play when video becomes active
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  // Hide controls after 3 seconds
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(movie.id);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleVideoClick = () => {
    setShowControls(true);
    togglePlayPause();
  };

  // Touch gestures for volume control
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!videoRef.current) return;
    
    const touchY = e.touches[0].clientY;
    const deltaY = touchStartY - touchY;
    
    // Swipe up to increase volume, down to decrease
    if (Math.abs(deltaY) > 50) {
      const currentVolume = videoRef.current.volume;
      const newVolume = Math.max(0, Math.min(1, currentVolume + (deltaY > 0 ? 0.1 : -0.1)));
      videoRef.current.volume = newVolume;
      
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
      
      setTouchStartY(touchY);
    }
  };

  return (
    <div 
      className={cn(
        "relative w-full h-screen bg-black overflow-hidden",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={movie.videoUrl || ''}
        poster={movie.verticalPosterUrl || movie.posterUrl}
        loop
        muted={isMuted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onClick={handleVideoClick}
        onLoadedData={() => {
          // Track video view
          if (videoRef.current) {
            fetch(`/api/videos/${movie.id}/analytics`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                deviceType: 'mobile',
                screenSize: 'sm',
                watchDuration: 0,
                completionRate: 0,
                liked: false,
                shared: false,
                fullscreen: false
              })
            });
          }
        }}
      />

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div 
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Video Info Overlay */}
      <div className="absolute bottom-20 left-4 right-20 text-white">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {movie.title}
        </h3>
        <p className="text-sm text-white/80 line-clamp-3 mb-2">
          {movie.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>{movie.viewCount || 0} lượt xem</span>
          <span>•</span>
          <span>{movie.duration}s</span>
          <span>•</span>
          <span>{movie.genre}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6">
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border-0",
              isLiked && "bg-red-500/20"
            )}
            onClick={handleLike}
          >
            <Heart 
              className={cn(
                "w-6 h-6",
                isLiked ? "fill-red-500 text-red-500" : "text-white"
              )} 
            />
          </Button>
          <span className="text-xs text-white mt-1">
            {(movie.likeCount || 0) + (isLiked ? 1 : 0)}
          </span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border-0"
            onClick={() => onComment?.(movie.id)}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
          <span className="text-xs text-white mt-1">0</span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border-0"
            onClick={() => onShare?.(movie.id)}
          >
            <Share2 className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* More Options */}
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border-0"
        >
          <MoreVertical className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Play/Pause Control */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm border-0"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </Button>
        </div>
      )}

      {/* Volume Control */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border-0"
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}
