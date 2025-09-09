import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Movie } from "@shared/schema";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const { data: heroMovies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies/hero'],
  });

  useEffect(() => {
    if (heroMovies.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroMovies.length]);

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setCurrentSlide(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && heroMovies.length > 0) {
      nextSlide();
    }
    if (isRightSwipe && heroMovies.length > 0) {
      previousSlide();
    }
  };

  // Handle transition state
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  if (isLoading || heroMovies.length === 0) {
    return (
      <section className="relative h-[60vh] md:h-[80vh] bg-muted animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      </section>
    );
  }

  const currentMovie = heroMovies[currentSlide];

  return (
    <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
      <div 
        className="flex transition-transform duration-300 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {heroMovies.map((movie, index) => (
          <div key={movie.id} className="min-w-full h-full relative">
            <img 
              src={movie.backdropUrl || movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 md:p-8 lg:p-16 max-w-full md:max-w-2xl">
              <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-2 md:mb-4" data-testid={`hero-title-${index}`}>
                {movie.title}
              </h2>
              <p className="text-sm md:text-lg lg:text-xl text-muted-foreground mb-4 md:mb-6 line-clamp-2 md:line-clamp-3" data-testid={`hero-description-${index}`}>
                {movie.description}
              </p>
              <div className="flex items-center space-x-2 md:space-x-4 mb-4 md:mb-6 flex-wrap">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs md:text-sm font-medium" data-testid={`hero-rating-${index}`}>
                  {movie.rating}
                </span>
                <span className="text-muted-foreground text-xs md:text-base" data-testid={`hero-year-${index}`}>{movie.year}</span>
                <span className="text-muted-foreground text-xs md:text-base" data-testid={`hero-duration-${index}`}>{movie.duration} phút</span>
                <span className="text-muted-foreground text-xs md:text-base hidden sm:inline" data-testid={`hero-genre-${index}`}>{movie.genre}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-4">
                <Button className="bg-primary text-primary-foreground px-4 md:px-8 py-2 md:py-3 hover:bg-primary/90 text-sm md:text-base" data-testid={`button-play-${index}`}>
                  <Play className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                  Xem ngay
                </Button>
                <Button variant="secondary" className="bg-white/20 text-white px-4 md:px-8 py-2 md:py-3 hover:bg-white/30 backdrop-blur text-sm md:text-base" data-testid={`button-watchlist-${index}`}>
                  <Plus className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Danh sách</span>
                  <span className="sm:hidden">+</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons - Hidden on mobile, visible on tablet+ */}
      <Button
        variant="ghost"
        size="sm"
        onClick={previousSlide}
        className="hidden md:block absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 md:p-3 rounded-full hover:bg-primary z-10"
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={nextSlide}
        className="hidden md:block absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 md:p-3 rounded-full hover:bg-primary z-10"
        data-testid="button-next-slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {heroMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-primary' : 'bg-white/50'
            }`}
            data-testid={`indicator-${index}`}
          />
        ))}
      </div>
    </section>
  );
}
