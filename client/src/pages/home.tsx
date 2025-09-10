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
import MobileHeader from "@/components/mobile-header";
import BottomNavigation from "@/components/bottom-navigation";
import VerticalVideoFeed from "@/components/vertical-video-feed";
import MobileMovieCard from "@/components/mobile-movie-card";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useMobileDevice } from "@/hooks/use-mobile";
import type { Movie } from "@shared/schema";

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const device = useMobileDevice();
  const sectionIds = ['hero-section', 'movies-section', 'series-section', 'shorts-section', 'vertical-videos-section', 'reviews-section'];
  const activeSection = useActiveSection(sectionIds);

  const { data: allMovies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
  });

  // Filter movies for vertical video feed (short films and trailers)
  const verticalVideos = allMovies.filter(movie => 
    movie.category === 'short' || movie.genre?.toLowerCase().includes('trailer')
  ).slice(0, 10); // Limit to 10 videos for demo

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({behavior: 'smooth'});
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen-mobile bg-background text-foreground">
      {/* Mobile-First Header */}
      <MobileHeader 
        onSearchOpen={() => setSearchOpen(true)}
        onSectionScroll={scrollToSection}
      />

      {/* Main Content - Add bottom padding for mobile navigation */}
      <main className="mobile:pb-[calc(var(--mobile-bottom-nav-height)+var(--mobile-safe-area-bottom))] md:pb-0">
        {/* Hero Section */}
        <section id="hero-section">
          <HeroSection />
        </section>
        
        <FeaturedMovies />
        <CategorySection />
        
        {/* Movies Section */}
        <section id="movies-section" className="py-mobile-lg md:py-12 px-mobile-md md:px-4">
          <div className="container mx-auto">
            <h2 className="text-xl-mobile md:text-2xl lg:text-3xl font-bold mb-mobile-md md:mb-8" data-testid="movies-section-title">
              Phim Lẻ
            </h2>
            <MoviesByCategory category="movie" />
          </div>
        </section>

        {/* Series Section */}
        <section id="series-section" className="py-mobile-lg md:py-12 px-mobile-md md:px-4 bg-muted/10">
          <div className="container mx-auto">
            <h2 className="text-xl-mobile md:text-2xl lg:text-3xl font-bold mb-mobile-md md:mb-8" data-testid="series-section-title">
              Phim Bộ
            </h2>
            <MoviesByCategory category="series" />
          </div>
        </section>

        {/* Short Films Section */}
        <section id="shorts-section" className="py-mobile-lg md:py-12 px-mobile-md md:px-4">
          <div className="container mx-auto">
            <h2 className="text-xl-mobile md:text-2xl lg:text-3xl font-bold mb-mobile-md md:mb-8" data-testid="shorts-section-title">
              Phim Ngắn
            </h2>
            <MoviesByCategory category="short" />
          </div>
        </section>

        {/* Vertical Videos Section (Mobile-First) */}
        <section id="vertical-videos-section" className="mobile:block md:hidden">
          <div className="py-mobile-lg">
            <div className="px-mobile-md mb-mobile-md">
              <h2 className="text-xl-mobile font-bold text-center" data-testid="vertical-videos-section-title">
                📱 Phim Dọc - Tối Ưu Mobile
              </h2>
              <p className="text-sm-mobile text-muted-foreground text-center mt-2">
                Trải nghiệm xem phim dọc như TikTok, Instagram Reels
              </p>
            </div>
            
            {verticalVideos.length > 0 ? (
              <VerticalVideoFeed 
                movies={verticalVideos}
                autoPlay={device.isMobile}
                className="h-[70vh]"
              />
            ) : (
              <div className="px-mobile-md">
                <div className="bg-muted/10 rounded-mobile p-mobile-lg text-center">
                  <p className="text-muted-foreground mb-mobile-md">
                    Chưa có video dọc nào. Đây là demo với movie cards:
                  </p>
                  <div className="grid grid-cols-2 gap-mobile-md max-w-md mx-auto">
                    {allMovies.slice(0, 4).map((movie) => (
                      <MobileMovieCard
                        key={movie.id}
                        movie={movie}
                        variant="poster"
                        onClick={() => console.log(`Clicked: ${movie.title}`)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews-section" className="py-mobile-lg md:py-12 px-mobile-md md:px-4 bg-muted/10">
          <div className="container mx-auto">
            <h2 className="text-xl-mobile md:text-2xl lg:text-3xl font-bold mb-mobile-md md:mb-8" data-testid="reviews-section-title">
              Review Phim
            </h2>
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

      {/* Mobile Bottom Navigation */}
      <BottomNavigation 
        onSearchOpen={() => setSearchOpen(true)}
        onSectionScroll={scrollToSection}
        activeSection={activeSection}
      />

      {/* Search Overlay */}
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
