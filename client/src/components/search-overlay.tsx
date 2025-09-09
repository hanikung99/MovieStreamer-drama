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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-background border-b border-border p-6 z-10">
          <div className="flex items-center space-x-4">
            <Search className="text-primary text-xl flex-shrink-0" />
            <Input
              type="text"
              placeholder="Tìm kiếm phim, diễn viên, đạo diễn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xl bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              data-testid="input-search"
            />
            <button 
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
              data-testid="button-close-search"
            >
              <X className="text-xl" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search Results */}
          {debouncedQuery.trim() && (
            <div className="mb-8">
              <h4 className="font-semibold mb-4" data-testid="search-results-title">
                Kết quả tìm kiếm cho "{debouncedQuery}"
              </h4>
              
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-muted animate-pulse rounded-lg h-64" />
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {searchResults.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      size="sm"
                      onClick={() => {
                        console.log('Open movie detail:', movie.id);
                        onOpenChange(false);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8" data-testid="no-results-message">
                  Không tìm thấy kết quả nào cho "{debouncedQuery}"
                </p>
              )}
            </div>
          )}

          {/* Popular Searches */}
          {!debouncedQuery.trim() && (
            <div>
              <h4 className="font-semibold mb-4" data-testid="popular-searches-title">Tìm kiếm phổ biến</h4>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handlePopularSearch(term)}
                    className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-accent transition-colors"
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
