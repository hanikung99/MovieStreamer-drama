import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MovieCard from "./movie-card";
import type { Movie } from "@shared/schema";

export default function MovieGrid() {
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedSort, setSelectedSort] = useState("latest");
  const [visibleMovies, setVisibleMovies] = useState(12);

  const { data: allMovies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
  });

  // Filter and sort movies
  const processedMovies = allMovies
    .filter(movie => selectedGenre === "all" || movie.genre.toLowerCase().includes(selectedGenre.toLowerCase()))
    .sort((a, b) => {
      switch (selectedSort) {
        case 'oldest':
          return a.year - b.year;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
          return b.rating - a.rating; // Using rating as popularity proxy
        case 'latest':
        default:
          return b.year - a.year;
      }
    });

  const displayedMovies = processedMovies.slice(0, visibleMovies);

  const loadMoreMovies = () => {
    setVisibleMovies(prev => prev + 12);
  };

  if (isLoading) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 bg-muted animate-pulse rounded w-32" />
            <div className="flex items-center space-x-4">
              <div className="h-10 bg-muted animate-pulse rounded w-32" />
              <div className="h-10 bg-muted animate-pulse rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-lg h-80" />
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
          <h2 className="text-2xl md:text-3xl font-bold" data-testid="all-movies-title">Tất cả phim</h2>
          <div className="flex items-center space-x-4">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-40" data-testid="select-genre">
                <SelectValue placeholder="Tất cả thể loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thể loại</SelectItem>
                <SelectItem value="hành động">Hành động</SelectItem>
                <SelectItem value="hài">Hài hước</SelectItem>
                <SelectItem value="lãng mạn">Lãng mạn</SelectItem>
                <SelectItem value="kinh dị">Kinh dị</SelectItem>
                <SelectItem value="khoa học">Khoa học viễn tưởng</SelectItem>
                <SelectItem value="chính kịch">Chính kịch</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="w-40" data-testid="select-sort">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="rating">Đánh giá cao</SelectItem>
                <SelectItem value="popular">Xem nhiều</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {displayedMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              size="sm"
              onClick={() => console.log('Open movie detail:', movie.id)}
            />
          ))}
        </div>

        {/* Load More Button */}
        {visibleMovies < processedMovies.length && (
          <div className="text-center mt-12">
            <Button 
              onClick={loadMoreMovies}
              className="bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90"
              data-testid="button-load-more"
            >
              Tải thêm phim
            </Button>
          </div>
        )}

        {processedMovies.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg" data-testid="no-movies-message">
              Không tìm thấy phim nào phù hợp với bộ lọc đã chọn.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
