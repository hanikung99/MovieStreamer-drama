import React, { useState, useEffect } from 'react';
import { VerticalVideoFeed } from '@/components/mobile/VerticalVideoFeed';
import { MobileNavigation, useMobileNavigation } from '@/components/mobile/MobileNavigation';
import { MobileMovieCard } from '@/components/mobile/MobileMovieCard';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  useNetworkQuality, 
  useBatteryStatus, 
  useMemoryMonitor,
  usePreloader 
} from '@/hooks/usePerformanceOptimization';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Movie } from '@shared/schema';

export default function MobilePage() {
  const isMobile = useIsMobile();
  const { activeTab, setActiveTab, favoriteCount } = useMobileNavigation();
  const { networkQuality, isOnline } = useNetworkQuality();
  const { shouldReducePerformance } = useBatteryStatus();
  const { isMemoryHigh } = useMemoryMonitor();
  const { preloadMultiple } = usePreloader();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch movies based on active tab
  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['movies', activeTab, selectedCategory],
    queryFn: async (): Promise<Movie[]> => {
      let endpoint = '/api/movies';
      
      if (activeTab === 'shorts') {
        endpoint = '/api/videos/vertical?limit=20';
      } else if (selectedCategory !== 'all') {
        endpoint = `/api/movies/category/${selectedCategory}`;
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch movies');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Search movies
  const { data: searchResults = [] } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async (): Promise<Movie[]> => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to search movies');
      return response.json();
    },
    enabled: searchQuery.length > 2,
    staleTime: 2 * 60 * 1000,
  });

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  // Preload images for better performance
  useEffect(() => {
    if (movies.length > 0 && !shouldReducePerformance) {
      const imagesToPreload = movies.slice(0, 5).map(movie => ({
        type: 'image' as const,
        src: movie.posterUrl
      }));
      preloadMultiple(imagesToPreload);
    }
  }, [movies, shouldReducePerformance, preloadMultiple]);

  const handleFavorite = (movieId: string) => {
    const newFavorites = favorites.includes(movieId)
      ? favorites.filter(id => id !== movieId)
      : [...favorites, movieId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handlePlay = (movie: Movie) => {
    // Track view
    fetch(`/api/movies/${movie.id}/view`, { method: 'POST' });
    
    // Navigate to video player or open modal
    console.log('Playing movie:', movie.title);
  };

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'movie', label: 'Phim lẻ' },
    { id: 'series', label: 'Phim bộ' },
    { id: 'short', label: 'Phim ngắn' }
  ];

  // Redirect to desktop version if not mobile
  if (!isMobile) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Mobile Experience</h1>
          <p className="text-muted-foreground mb-4">
            Trang này được tối ưu cho thiết bị mobile. Vui lòng truy cập bằng điện thoại hoặc thu nhỏ cửa sổ trình duyệt.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  // Shorts tab - Full screen vertical video feed
  if (activeTab === 'shorts') {
    return (
      <>
        <VerticalVideoFeed />
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          favoriteCount={favoriteCount}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Performance indicators */}
      {(!isOnline || networkQuality === 'slow' || isMemoryHigh()) && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-2">
          <div className="flex items-center gap-2 text-xs text-yellow-600">
            {!isOnline && <Badge variant="destructive">Offline</Badge>}
            {networkQuality === 'slow' && <Badge variant="secondary">Slow Connection</Badge>}
            {isMemoryHigh() && <Badge variant="secondary">High Memory Usage</Badge>}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold mb-3">
            {activeTab === 'home' && 'Trang chủ'}
            {activeTab === 'search' && 'Tìm kiếm'}
            {activeTab === 'favorites' && 'Yêu thích'}
            {activeTab === 'profile' && 'Cá nhân'}
          </h1>

          {/* Search bar */}
          {(activeTab === 'search' || activeTab === 'home') && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Category filters */}
          {activeTab === 'home' && !searchQuery && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {/* Search Results */}
        {activeTab === 'search' && searchQuery && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Kết quả cho "{searchQuery}" ({searchResults.length})
            </h2>
            {searchResults.map((movie) => (
              <MobileMovieCard
                key={movie.id}
                movie={movie}
                variant="compact"
                onPlay={handlePlay}
                onFavorite={handleFavorite}
              />
            ))}
            {searchResults.length === 0 && searchQuery.length > 2 && (
              <div className="text-center py-8 text-muted-foreground">
                Không tìm thấy kết quả nào
              </div>
            )}
          </div>
        )}

        {/* Home Content */}
        {activeTab === 'home' && !searchQuery && (
          <div className="space-y-6">
            {/* Featured Movie */}
            {movies.find(m => m.featured === 2) && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Nổi bật</h2>
                <MobileMovieCard
                  movie={movies.find(m => m.featured === 2)!}
                  variant="featured"
                  onPlay={handlePlay}
                  onFavorite={handleFavorite}
                />
              </section>
            )}

            {/* Movie Grid */}
            <section>
              <h2 className="text-lg font-semibold mb-3">
                {selectedCategory === 'all' ? 'Tất cả phim' : 
                 categories.find(c => c.id === selectedCategory)?.label}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {movies
                  .filter(m => m.featured !== 2)
                  .map((movie) => (
                    <MobileMovieCard
                      key={movie.id}
                      movie={movie}
                      onPlay={handlePlay}
                      onFavorite={handleFavorite}
                    />
                  ))}
              </div>
            </section>
          </div>
        )}

        {/* Favorites */}
        {activeTab === 'favorites' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Phim yêu thích ({favorites.length})
            </h2>
            {favorites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có phim yêu thích nào
              </div>
            ) : (
              movies
                .filter(movie => favorites.includes(movie.id))
                .map((movie) => (
                  <MobileMovieCard
                    key={movie.id}
                    movie={movie}
                    variant="compact"
                    onPlay={handlePlay}
                    onFavorite={handleFavorite}
                  />
                ))
            )}
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Người dùng</h2>
              <p className="text-muted-foreground">
                Tính năng đăng nhập sẽ được cập nhật sớm
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-lg p-4">
                <h3 className="font-semibold mb-2">Thống kê</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Phim yêu thích</div>
                    <div className="font-semibold">{favorites.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Chất lượng mạng</div>
                    <div className="font-semibold capitalize">{networkQuality}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        favoriteCount={favoriteCount}
      />
    </div>
  );
}
