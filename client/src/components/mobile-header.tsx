import { useState } from "react";
import { Search, Menu, X, User, Home, Film, Tv, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileDevice } from "@/hooks/use-mobile";

interface MobileHeaderProps {
  onSearchOpen: () => void;
  onSectionScroll: (sectionId: string) => void;
}

export default function MobileHeader({ onSearchOpen, onSectionScroll }: MobileHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const device = useMobileDevice();

  const navigationItems = [
    { id: 'home', label: 'Trang chủ', icon: Home, action: () => window.location.reload() },
    { id: 'movies-section', label: 'Phim lẻ', icon: Film, action: () => onSectionScroll('movies-section') },
    { id: 'series-section', label: 'Phim bộ', icon: Tv, action: () => onSectionScroll('series-section') },
    { id: 'shorts-section', label: 'Phim ngắn', icon: Clock, action: () => onSectionScroll('shorts-section') },
    { id: 'reviews-section', label: 'Review', icon: Star, action: () => onSectionScroll('reviews-section') },
  ];

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile:block md:hidden sticky top-0 z-mobile-header w-full border-b border-border bg-background/95 backdrop-blur-mobile pt-safe">
        <div className="h-mobile-header px-mobile-md flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-lg-mobile font-bold text-primary select-none-mobile" data-testid="mobile-logo">
              CinemaHub
            </h1>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-mobile-xs">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchOpen}
              className="touch-target p-mobile-xs hover:bg-accent transition-mobile focus-mobile"
              data-testid="mobile-search-button"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Tìm kiếm</span>
            </Button>
            
            {/* Menu Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="touch-target p-mobile-xs transition-mobile focus-mobile" 
              data-testid="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">
                {mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 top-[calc(var(--mobile-header-height)+var(--mobile-safe-area-top))] z-mobile-overlay bg-background/95 backdrop-blur-mobile animate-fade-in-mobile"
            data-testid="mobile-menu-overlay"
          >
            <div className="p-mobile-lg space-y-mobile-xs">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-mobile-md p-mobile-md rounded-mobile text-left text-base-mobile font-medium text-foreground hover:text-primary hover:bg-accent/50 transition-mobile touch-manipulation focus-mobile"
                    data-testid={`mobile-nav-${item.id}`}
                    onClick={() => handleNavClick(item.action)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              {/* Login Button for Mobile */}
              <div className="pt-mobile-md border-t border-border/50">
                <Button 
                  className="w-full touch-target-comfortable justify-start gap-mobile-md text-base-mobile font-medium transition-mobile"
                  data-testid="mobile-login-button"
                >
                  <User className="h-5 w-5" />
                  Đăng nhập
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Header (unchanged for now) */}
      <header className="hidden md:block sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-primary" data-testid="logo">CinemaHub</h1>
          
          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-6">
            <button className="text-foreground hover:text-primary transition-colors" data-testid="nav-home" onClick={() => window.location.reload()}>Trang chủ</button>
            <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-movies" onClick={() => onSectionScroll('movies-section')}>Phim lẻ</button>
            <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-series" onClick={() => onSectionScroll('series-section')}>Phim bộ</button>
            <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-shorts" onClick={() => onSectionScroll('shorts-section')}>Phim ngắn</button>
            <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-reviews" onClick={() => onSectionScroll('reviews-section')}>Review</button>
          </nav>
          
          {/* Desktop Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchOpen}
              className="p-2 hover:bg-accent"
              data-testid="button-search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button size="sm" data-testid="button-login">
              <User className="h-4 w-4 mr-2" />
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
