import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Movie } from "@shared/schema";

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function MovieCard({ movie, onClick, className = "", size = "md" }: MovieCardProps) {
  const sizeClasses = {
    sm: "w-40 md:w-48",
    md: "w-48 md:w-56",
    lg: "w-56 md:w-64"
  };

  const heightClasses = {
    sm: "h-56 md:h-72",
    md: "h-64 md:h-80",
    lg: "h-80 md:h-96"
  };

  return (
    <Card 
      className={`${sizeClasses[size]} bg-card rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${className}`}
      onClick={onClick}
      data-testid={`movie-card-${movie.id}`}
    >
      <div className="relative">
        <img 
          src={movie.posterUrl}
          alt={movie.title}
          className={`w-full ${heightClasses[size]} object-cover`}
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded flex items-center space-x-1">
          <Star className="h-3 w-3 text-primary fill-primary" />
          <span className="text-xs text-white font-medium" data-testid={`rating-${movie.id}`}>
            {movie.rating}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1" data-testid={`title-${movie.id}`}>
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span data-testid={`year-${movie.id}`}>{movie.year}</span>
          <span className="text-xs bg-muted px-2 py-1 rounded" data-testid={`duration-${movie.id}`}>
            {movie.category === "series" && movie.episodes ? `${movie.episodes} tập` : `${movie.duration}m`}
          </span>
        </div>
        {movie.director && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1" data-testid={`director-${movie.id}`}>
            Đạo diễn: {movie.director}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1" data-testid={`genre-${movie.id}`}>
          {movie.genre}
        </p>
      </div>
    </Card>
  );
}
