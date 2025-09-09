import { useQuery } from "@tanstack/react-query";
import MovieCard from "./movie-card";
import type { Movie } from "@shared/schema";

interface MoviesByCategoryProps {
  category: string;
}

export default function MoviesByCategory({ category }: MoviesByCategoryProps) {
  const { data: movies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies/category', category],
    queryFn: async () => {
      const response = await fetch(`/api/movies/category/${category}`);
      if (!response.ok) throw new Error('Failed to fetch movies');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-none w-40 md:w-48 lg:w-56 bg-muted animate-pulse rounded-lg h-60 md:h-80" />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8" data-testid={`no-${category}-message`}>
        Chưa có nội dung cho danh mục này.
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide px-1">
        {movies.map((movie) => (
          <div key={movie.id} className="flex-none">
            <MovieCard 
              movie={movie}
              size="sm"
              onClick={() => console.log('Open movie detail:', movie.id)}
              className="transition-transform active:scale-95 md:hover:scale-105"
            />
            {/* Display episode count for series */}
            {category === "series" && movie.episodes && (
              <div className="mt-1 md:mt-2 text-center">
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded" data-testid={`episodes-${movie.id}`}>
                  {movie.episodes} tập
                </span>
              </div>
            )}
            {/* Display duration for short films and reviews */}
            {(category === "short" || category === "review") && (
              <div className="mt-1 md:mt-2 text-center">
                <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded" data-testid={`duration-${movie.id}`}>
                  {movie.duration} phút
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}