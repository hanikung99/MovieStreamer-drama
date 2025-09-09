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
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 bg-muted animate-pulse rounded w-48" />
            <div className="h-6 bg-muted animate-pulse rounded w-24" />
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-none w-48 md:w-56 bg-muted animate-pulse rounded-lg h-80" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold" data-testid="featured-title">Phim nổi bật</h2>
          <Button variant="ghost" className="text-primary hover:text-primary/80 p-0" data-testid="button-view-all-featured">
            <span>Xem tất cả</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="relative">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {featuredMovies.map((movie) => (
              <div key={movie.id} className="flex-none">
                <MovieCard 
                  movie={movie}
                  onClick={() => console.log('Open movie detail:', movie.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
