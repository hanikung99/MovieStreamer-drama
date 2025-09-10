import { useState } from "react";
import { Home, Film, Tv, Clock, Star, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileDevice } from "@/hooks/use-mobile";

interface BottomNavigationProps {
  onSearchOpen: () => void;
  onSectionScroll: (sectionId: string) => void;
  activeSection?: string;
}

export default function BottomNavigation({ 
  onSearchOpen, 
  onSectionScroll, 
  activeSection = 'home' 
}: BottomNavigationProps) {
  const device = useMobileDevice();

  const navigationItems = [
    { 
      id: 'home', 
      label: 'Trang chủ', 
      icon: Home, 
      action: () => window.location.reload(),
      testId: 'bottom-nav-home'
    },
    { 
      id: 'movies-section', 
      label: 'Phim lẻ', 
      icon: Film, 
      action: () => onSectionScroll('movies-section'),
      testId: 'bottom-nav-movies'
    },
    { 
      id: 'search', 
      label: 'Tìm kiếm', 
      icon: Search, 
      action: onSearchOpen,
      testId: 'bottom-nav-search',
      isSpecial: true // Highlight search button
    },
    { 
      id: 'series-section', 
      label: 'Phim bộ', 
      icon: Tv, 
      action: () => onSectionScroll('series-section'),
      testId: 'bottom-nav-series'
    },
    { 
      id: 'profile', 
      label: 'Cá nhân', 
      icon: User, 
      action: () => {}, // TODO: Navigate to profile
      testId: 'bottom-nav-profile'
    },
  ];

  return (
    <nav 
      className="mobile:block md:hidden fixed bottom-0 left-0 right-0 z-mobile-nav bg-background/95 backdrop-blur-mobile border-t border-border pb-safe"
      data-testid="bottom-navigation"
    >
      <div className="h-mobile-nav flex items-center justify-around px-mobile-xs">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isSpecial = item.isSpecial;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={item.action}
              className={`
                flex flex-col items-center justify-center gap-1 
                touch-target-comfortable px-mobile-xs py-mobile-xs
                transition-mobile focus-mobile
                ${isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
                }
                ${isSpecial 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-full' 
                  : 'rounded-mobile'
                }
              `}
              data-testid={item.testId}
            >
              <Icon className={`h-5 w-5 ${isSpecial ? 'h-6 w-6' : ''}`} />
              <span className={`text-xs-mobile font-medium leading-none ${isSpecial ? 'sr-only' : ''}`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}


