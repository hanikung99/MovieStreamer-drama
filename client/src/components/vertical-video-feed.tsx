import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileDevice } from "@/hooks/use-mobile";
import MobileMovieCard from "./mobile-movie-card";
import type { Movie } from "@shared/schema";

interface VerticalVideoFeedProps {
  movies: Movie[];
  className?: string;
  autoPlay?: boolean;
}

export default function VerticalVideoFeed({ 
  movies, 
  className = "",
  autoPlay = true 
}: VerticalVideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const device = useMobileDevice();

  // Handle scroll navigation
  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const targetIndex = Math.max(0, Math.min(index, movies.length - 1));
    
    container.scrollTo({
      top: targetIndex * container.clientHeight,
      behavior: 'smooth'
    });
    
    setCurrentIndex(targetIndex);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < movies.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Set new timeout to detect scroll end
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        
        // Snap to nearest video
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const newIndex = Math.round(scrollTop / containerHeight);
        
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
          scrollToIndex(newIndex);
        }
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [currentIndex]);

  // Handle touch gestures for mobile
  useEffect(() => {
    if (!device.isTouchDevice) return;

    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      const deltaY = startY - endY;
      const deltaTime = endTime - startTime;
      
      // Detect swipe gesture (minimum distance and maximum time)
      if (Math.abs(deltaY) > 50 && deltaTime < 300) {
        if (deltaY > 0) {
          // Swipe up - next video
          handleNext();
        } else {
          // Swipe down - previous video
          handlePrevious();
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, device.isTouchDevice]);

  if (!movies.length) {
    return (
      <div className="flex items-center justify-center h-screen-mobile bg-muted/10">
        <p className="text-muted-foreground">Không có video nào để hiển thị</p>
      </div>
    );
  }

  return (
    <div 
      className={`
        relative w-full h-screen-mobile overflow-hidden bg-black
        ${className}
      `}
      data-testid="vertical-video-feed"
    >
      {/* Video Container */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto scroll-smooth-mobile snap-y snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie, index) => (
          <div 
            key={movie.id}
            className="h-full w-full snap-start snap-always flex items-center justify-center p-mobile-md"
          >
            <MobileMovieCard
              movie={movie}
              variant="vertical"
              autoPlay={autoPlay && index === currentIndex}
              showVideoPlayer={index === currentIndex}
              onVideoPlay={() => {
                // Handle video play analytics or other actions
                console.log(`Playing video: ${movie.title}`);
              }}
              className="max-w-sm"
            />
          </div>
        ))}
      </div>

      {/* Navigation Controls (Desktop) */}
      {!device.isMobile && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="touch-target bg-black/50 text-white hover:bg-black/70 rounded-full backdrop-blur-mobile transition-mobile"
            data-testid="previous-video"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === movies.length - 1}
            className="touch-target bg-black/50 text-white hover:bg-black/70 rounded-full backdrop-blur-mobile transition-mobile"
            data-testid="next-video"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="absolute right-mobile-sm top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
        {movies.map((_, index) => (
          <div
            key={index}
            className={`
              w-1 h-8 rounded-full transition-mobile cursor-pointer
              ${index === currentIndex ? 'bg-primary' : 'bg-white/30'}
            `}
            onClick={() => scrollToIndex(index)}
            data-testid={`progress-indicator-${index}`}
          />
        ))}
      </div>

      {/* Video Counter */}
      <div className="absolute top-mobile-md left-mobile-md pt-safe">
        <div className="bg-black/50 backdrop-blur-mobile px-mobile-sm py-1 rounded-full">
          <span className="text-xs text-white font-medium">
            {currentIndex + 1} / {movies.length}
          </span>
        </div>
      </div>

      {/* Instructions (Mobile) */}
      {device.isMobile && currentIndex === 0 && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
          <div className="bg-black/70 backdrop-blur-mobile px-mobile-md py-mobile-sm rounded-full">
            <p className="text-xs text-white/80 text-center">
              Vuốt lên để xem video tiếp theo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
