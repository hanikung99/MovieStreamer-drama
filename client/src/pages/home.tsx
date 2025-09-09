import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/hero-section";
import FeaturedMovies from "@/components/featured-movies";
import MovieGrid from "@/components/movie-grid";
import CategorySection from "@/components/category-section";
import SearchOverlay from "@/components/search-overlay";
import MoviesByCategory from "@/components/movies-by-category";
import type { Movie } from "@shared/schema";

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: allMovies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-primary" data-testid="logo">CinemaHub</h1>
            <nav className="hidden md:flex items-center space-x-6">
              <button className="text-foreground hover:text-primary transition-colors" data-testid="nav-home" onClick={() => window.location.reload()}>Trang chủ</button>
              <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-movies" onClick={() => document.getElementById('movies-section')?.scrollIntoView({behavior: 'smooth'})}>Phim lẻ</button>
              <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-series" onClick={() => document.getElementById('series-section')?.scrollIntoView({behavior: 'smooth'})}>Phim bộ</button>
              <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-shorts" onClick={() => document.getElementById('shorts-section')?.scrollIntoView({behavior: 'smooth'})}>Phim ngắn</button>
              <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-reviews" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({behavior: 'smooth'})}>Review</button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-accent"
              data-testid="button-search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button className="hidden md:block" data-testid="button-login">
              <User className="h-4 w-4 mr-2" />
              Đăng nhập
            </Button>
            <Button variant="ghost" size="sm" className="md:hidden p-2" data-testid="button-menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection />
        <FeaturedMovies />
        <CategorySection />
        
        {/* Movies Section */}
        <section id="movies-section" className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8" data-testid="movies-section-title">Phim Lẻ</h2>
            <MoviesByCategory category="movie" />
          </div>
        </section>

        {/* Series Section */}
        <section id="series-section" className="py-12 px-4 bg-muted/10">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8" data-testid="series-section-title">Phim Bộ</h2>
            <MoviesByCategory category="series" />
          </div>
        </section>

        {/* Short Films Section */}
        <section id="shorts-section" className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8" data-testid="shorts-section-title">Phim Ngắn</h2>
            <MoviesByCategory category="short" />
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews-section" className="py-12 px-4 bg-muted/10">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8" data-testid="reviews-section-title">Review Phim</h2>
            <MoviesByCategory category="review" />
          </div>
        </section>

        <MovieGrid />
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">CinemaHub</h3>
              <p className="text-muted-foreground mb-4">
                Nền tảng xem phim trực tuyến hàng đầu với hàng nghìn bộ phim chất lượng cao.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-youtube">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Thể loại</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-action">Phim hành động</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-comedy">Phim hài</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-horror">Phim kinh dị</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-romance">Phim lãng mạn</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-scifi">Phim khoa học viễn tưởng</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-help">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-contact">Liên hệ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-report">Báo cáo sự cố</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-terms">Điều khoản sử dụng</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-privacy">Chính sách bảo mật</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Tải ứng dụng</h4>
              <div className="space-y-3">
                <a href="#" className="flex items-center space-x-3 bg-card p-3 rounded-lg hover:bg-accent transition-colors" data-testid="link-appstore">
                  <i className="fab fa-apple text-2xl"></i>
                  <div>
                    <div className="text-xs text-muted-foreground">Tải về từ</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </a>
                <a href="#" className="flex items-center space-x-3 bg-card p-3 rounded-lg hover:bg-accent transition-colors" data-testid="link-playstore">
                  <i className="fab fa-google-play text-2xl"></i>
                  <div>
                    <div className="text-xs text-muted-foreground">Tải về từ</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 CinemaHub. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>

      {/* Search Overlay */}
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
