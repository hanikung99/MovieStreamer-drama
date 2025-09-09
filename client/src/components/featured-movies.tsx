import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieCard from "./movie-card";
import type { Movie } from "@shared/schema";

export default function FeaturedMovies() {
  const { data: featuredMovies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies/featured'],
  });

  if (isLoading) {
    return (
      <section className="py-6 md:py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className="h-6 md:h-8 bg-muted animate-pulse rounded w-32 md:w-48" />
            <div className="h-4 md:h-6 bg-muted animate-pulse rounded w-16 md:w-24" />
          </div>
          <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-none w-40 md:w-48 lg:w-56 bg-muted animate-pulse rounded-lg h-60 md:h-80" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-12 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold" data-testid="featured-title">Phim nổi bật</h2>
          <Button variant="ghost" className="text-primary hover:text-primary/80 p-0 text-sm md:text-base" data-testid="button-view-all-featured">
            <span className="hidden sm:inline">Xem tất cả</span>
            <span className="sm:hidden">Xem thêm</span>
            <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
          </Button>
        </div>
        
        <div className="relative">
          <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide px-1">
            {featuredMovies.map((movie) => (
              <div key={movie.id} className="flex-none">
                <MovieCard 
                  movie={movie}
                  size="md"
                  onClick={() => console.log('Open movie detail:', movie.id)}
                  className="transition-transform active:scale-95 md:hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
