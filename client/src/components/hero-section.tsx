import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Movie } from "@shared/schema";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
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
    setCurrentSlide(index);
  };

  if (isLoading || heroMovies.length === 0) {
    return (
      <section className="relative h-[80vh] bg-muted animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      </section>
    );
  }

  const currentMovie = heroMovies[currentSlide];

  return (
    <section className="relative h-[80vh] overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {heroMovies.map((movie, index) => (
          <div key={movie.id} className="min-w-full h-full relative">
            <img 
              src={movie.backdropUrl || movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-bold mb-4" data-testid={`hero-title-${index}`}>
                {movie.title}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-6 line-clamp-3" data-testid={`hero-description-${index}`}>
                {movie.description}
              </p>
              <div className="flex items-center space-x-4 mb-6">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium" data-testid={`hero-rating-${index}`}>
                  {movie.rating}
                </span>
                <span className="text-muted-foreground" data-testid={`hero-year-${index}`}>{movie.year}</span>
                <span className="text-muted-foreground" data-testid={`hero-duration-${index}`}>{movie.duration} phút</span>
                <span className="text-muted-foreground" data-testid={`hero-genre-${index}`}>{movie.genre}</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button className="bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90" data-testid={`button-play-${index}`}>
                  <Play className="h-5 w-5 mr-2" />
                  Xem ngay
                </Button>
                <Button variant="secondary" className="bg-white/20 text-white px-8 py-3 hover:bg-white/30 backdrop-blur" data-testid={`button-watchlist-${index}`}>
                  <Plus className="h-5 w-5 mr-2" />
                  Danh sách
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="sm"
        onClick={previousSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-primary z-10"
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-primary z-10"
        data-testid="button-next-slide"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {heroMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-primary' : 'bg-white/50'
            }`}
            data-testid={`indicator-${index}`}
          />
        ))}
      </div>
    </section>
  );
}
