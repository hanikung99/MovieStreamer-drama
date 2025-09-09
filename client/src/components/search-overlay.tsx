import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import MovieCard from "./movie-card";
import type { Movie } from "@shared/schema";

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies/search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  const popularSearches = ["Marvel", "Phim hành động", "Phim hài", "Phim kinh dị"];

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl h-[90vh] md:max-h-[80vh] overflow-y-auto p-0 m-4 md:m-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 md:p-6 z-10">
          <div className="flex items-center space-x-3 md:space-x-4">
            <Search className="text-primary text-lg md:text-xl flex-shrink-0" />
            <Input
              type="text"
              placeholder="Tìm kiếm phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-base md:text-xl bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              data-testid="input-search"
              autoFocus
            />
            <button 
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground flex-shrink-0 p-1"
              data-testid="button-close-search"
            >
              <X className="text-lg md:text-xl" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Search Results */}
          {debouncedQuery.trim() && (
            <div className="mb-6 md:mb-8">
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base" data-testid="search-results-title">
                Kết quả cho "{debouncedQuery}"
              </h4>
              
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-muted animate-pulse rounded-lg h-52 md:h-64" />
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  {searchResults.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      size="sm"
                      onClick={() => {
                        console.log('Open movie detail:', movie.id);
                        onOpenChange(false);
                      }}
                      className="transition-transform active:scale-95 md:hover:scale-105"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6 md:py-8 text-sm md:text-base" data-testid="no-results-message">
                  Không tìm thấy kết quả nào cho "{debouncedQuery}"
                </p>
              )}
            </div>
          )}

          {/* Popular Searches */}
          {!debouncedQuery.trim() && (
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base" data-testid="popular-searches-title">Tìm kiếm phổ biến</h4>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handlePopularSearch(term)}
                    className="bg-muted text-muted-foreground px-3 py-2 rounded-full text-sm cursor-pointer hover:bg-accent active:bg-accent transition-colors"
                    data-testid={`popular-search-${term.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
