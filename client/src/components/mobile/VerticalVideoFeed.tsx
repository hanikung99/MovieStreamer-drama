import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VerticalVideoPlayer } from './VerticalVideoPlayer';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Movie } from '@shared/schema';

interface VerticalVideoFeedProps {
  className?: string;
}

export function VerticalVideoFeed({ className }: VerticalVideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch vertical videos
  const { data: videos = [], isLoading, error, refetch } = useQuery({
    queryKey: ['vertical-videos'],
    queryFn: async (): Promise<Movie[]> => {
      const response = await fetch('/api/videos/vertical?limit=20');
      if (!response.ok) {
        throw new Error('Failed to fetch vertical videos');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Preload next videos for smooth experience
  useEffect(() => {
    if (videos.length > 0) {
      const preloadNext = (index: number) => {
        const nextVideo = videos[index + 1];
        if (nextVideo?.videoUrl) {
          const video = document.createElement('video');
          video.src = nextVideo.videoUrl;
          video.preload = 'metadata';
        }
      };

      // Preload next 2 videos
      preloadNext(currentIndex);
      preloadNext(currentIndex + 1);
    }
  }, [currentIndex, videos]);

  const goToNext = useCallback(() => {
    if (currentIndex < videos.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, videos.length, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, isTransitioning]);

  // Touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchStartTime(Date.now());
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    const deltaY = touchStartY - touchEndY;
    const deltaTime = touchEndTime - touchStartTime;
    const velocity = Math.abs(deltaY) / deltaTime;

    // Minimum swipe distance and velocity for navigation
    const minSwipeDistance = 50;
    const minVelocity = 0.3;

    if (Math.abs(deltaY) > minSwipeDistance && velocity > minVelocity) {
      if (deltaY > 0) {
        // Swipe up - next video
        goToNext();
      } else {
        // Swipe down - previous video
        goToPrevious();
      }
    }
  };

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowDown':
          e.preventDefault();
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          // Space bar handled by video player
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  const handleLike = async (movieId: string) => {
    try {
      await fetch(`/api/movies/${movieId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment: true })
      });
    } catch (error) {
      console.error('Failed to like video:', error);
    }
  };

  const handleShare = async (movieId: string) => {
    const movie = videos.find(v => v.id === movieId);
    if (!movie) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: movie.title,
          text: movie.description,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Failed to share video:', error);
    }
  };

  const handleComment = (movieId: string) => {
    // This would open a comment modal/sheet
    console.log('Open comments for:', movieId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Đang tải video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center text-white">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="mb-4">Không thể tải video</p>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center text-white">
          <p>Không có video nào</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-black ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="main"
      aria-label="Vertical video feed"
    >
      {/* Video Container */}
      <div 
        className="relative w-full h-full transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(-${currentIndex * 100}vh)`,
        }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: `translateY(${index * 100}vh)` }}
          >
            <VerticalVideoPlayer
              movie={video}
              isActive={index === currentIndex}
              onLike={handleLike}
              onShare={handleShare}
              onComment={handleComment}
            />
          </div>
        ))}
      </div>

      {/* Navigation Indicators */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
        {videos.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-white' 
                : index < currentIndex 
                  ? 'bg-white/40' 
                  : 'bg-white/20'
            }`}
            role="progressbar"
            aria-valuenow={index === currentIndex ? 100 : 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Video ${index + 1} of ${videos.length}`}
          />
        ))}
      </div>

      {/* Swipe Hint (show only for first few seconds) */}
      {currentIndex === 0 && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-white/60 text-sm text-center animate-pulse">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-white/40 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
            </div>
            <p>Vuốt lên để xem video tiếp theo</p>
          </div>
        </div>
      )}

      {/* Accessibility: Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Video {currentIndex + 1} of {videos.length}: {videos[currentIndex]?.title}
      </div>
    </div>
  );
}
