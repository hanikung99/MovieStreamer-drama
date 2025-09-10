import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, MoreVertical, Heart, Share, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileDevice } from "@/hooks/use-mobile";
import type { Movie } from "@shared/schema";

interface VerticalVideoPlayerProps {
  movie: Movie;
  autoPlay?: boolean;
  muted?: boolean;
  onVideoEnd?: () => void;
  onVideoStart?: () => void;
  className?: string;
}

export default function VerticalVideoPlayer({ 
  movie, 
  autoPlay = false, 
  muted = true,
  onVideoEnd,
  onVideoStart,
  className = "" 
}: VerticalVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const device = useMobileDevice();

  // Auto-hide controls after 3 seconds
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      onVideoStart?.();
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoClick = () => {
    if (device.isTouchDevice) {
      setShowControls(!showControls);
      if (!showControls) {
        resetControlsTimeout();
      }
    } else {
      handlePlayPause();
    }
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onVideoEnd?.();
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onVideoEnd]);

  // Auto-play when in view (for mobile feed)
  useEffect(() => {
    if (!autoPlay || !videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            videoRef.current?.play();
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [autoPlay]);

  return (
    <div 
      ref={containerRef}
      className={`
        relative bg-black rounded-mobile overflow-hidden
        aspect-vertical max-h-screen-mobile
        ${isFullscreen ? 'fixed inset-0 z-mobile-modal rounded-none' : ''}
        ${className}
      `}
      data-testid={`vertical-video-${movie.id}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={movie.posterUrl}
        muted={isMuted}
        playsInline
        preload="metadata"
        onClick={handleVideoClick}
        onMouseMove={() => {
          if (!device.isTouchDevice) {
            setShowControls(true);
            resetControlsTimeout();
          }
        }}
        onMouseLeave={() => {
          if (!device.isTouchDevice) {
            setShowControls(false);
          }
        }}
      >
        {/* TODO: Add actual video source */}
        <source src={`/api/videos/${movie.id}.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {!duration && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!isPlaying && duration > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePlayPause}
            className="touch-target-large bg-black/50 hover:bg-black/70 text-white rounded-full transition-mobile"
            data-testid="play-button"
          >
            <Play className="h-8 w-8 ml-1" fill="currentColor" />
          </Button>
        </div>
      )}

      {/* Video Controls */}
      {showControls && isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50">
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-mobile-md pt-safe flex items-center justify-between">
            <div className="flex items-center gap-mobile-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMuteToggle}
                className="touch-target text-white hover:bg-white/20 transition-mobile"
                data-testid="mute-button"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
            
            <div className="flex items-center gap-mobile-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreen}
                className="touch-target text-white hover:bg-white/20 transition-mobile"
                data-testid="fullscreen-button"
              >
                <Maximize className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="touch-target text-white hover:bg-white/20 transition-mobile"
                data-testid="more-button"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Center Play/Pause */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePlayPause}
              className="touch-target-large bg-black/30 hover:bg-black/50 text-white rounded-full transition-mobile opacity-0 hover:opacity-100"
              data-testid="center-play-pause"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" fill="currentColor" />}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-mobile-md pb-safe">
            {/* Progress Bar */}
            <div className="mb-mobile-sm">
              <div className="w-full bg-white/30 rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/80 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Action Buttons (Mobile) */}
      {device.isMobile && (
        <div className="absolute right-mobile-md bottom-20 flex flex-col gap-mobile-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className={`
              touch-target-comfortable rounded-full backdrop-blur-mobile
              ${isLiked ? 'bg-red-500/20 text-red-500' : 'bg-black/30 text-white'}
              hover:bg-black/50 transition-mobile
            `}
            data-testid="like-button"
          >
            <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="touch-target-comfortable rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-mobile transition-mobile"
            data-testid="comment-button"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="touch-target-comfortable rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-mobile transition-mobile"
            data-testid="share-button"
          >
            <Share className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Movie Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-mobile-md pb-safe bg-gradient-to-t from-black/80 to-transparent">
        <div className="text-white">
          <h3 className="text-lg-mobile font-bold mb-1 line-clamp-2" data-testid={`video-title-${movie.id}`}>
            {movie.title}
          </h3>
          <p className="text-sm-mobile text-white/80 mb-2 line-clamp-2" data-testid={`video-description-${movie.id}`}>
            {movie.description}
          </p>
          <div className="flex items-center gap-mobile-md text-xs-mobile text-white/70">
            <span>{movie.year}</span>
            <span>•</span>
            <span>{movie.genre}</span>
            <span>•</span>
            <span>{movie.duration}m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
