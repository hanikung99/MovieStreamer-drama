import React from 'react';
import { Home, Search, Heart, User, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  activeTab: 'home' | 'shorts' | 'search' | 'favorites' | 'profile';
  onTabChange: (tab: 'home' | 'shorts' | 'search' | 'favorites' | 'profile') => void;
  favoriteCount?: number;
  className?: string;
}

export function MobileNavigation({
  activeTab,
  onTabChange,
  favoriteCount = 0,
  className
}: MobileNavigationProps) {
  const tabs = [
    {
      id: 'home' as const,
      label: 'Trang chủ',
      icon: Home,
      badge: null
    },
    {
      id: 'shorts' as const,
      label: 'Shorts',
      icon: Play,
      badge: null
    },
    {
      id: 'search' as const,
      label: 'Tìm kiếm',
      icon: Search,
      badge: null
    },
    {
      id: 'favorites' as const,
      label: 'Yêu thích',
      icon: Heart,
      badge: favoriteCount > 0 ? favoriteCount : null
    },
    {
      id: 'profile' as const,
      label: 'Cá nhân',
      icon: User,
      badge: null
    }
  ];

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border",
        "safe-area-inset-bottom", // For devices with home indicator
        className
      )}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0 flex-1",
                "hover:bg-transparent active:scale-95 transition-all duration-200",
                isActive && "text-primary"
              )}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive && "scale-110"
                  )} 
                />
                {tab.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs flex items-center justify-center min-w-0"
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Badge>
                )}
              </div>
              <span 
                className={cn(
                  "text-xs font-medium transition-all duration-200 truncate max-w-full",
                  isActive ? "text-primary scale-105" : "text-muted-foreground"
                )}
              >
                {tab.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Button>
          );
        })}
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}

// Hook for managing mobile navigation state
export function useMobileNavigation() {
  const [activeTab, setActiveTab] = React.useState<'home' | 'shorts' | 'search' | 'favorites' | 'profile'>('home');
  const [favoriteCount, setFavoriteCount] = React.useState(0);

  // Update favorite count from API or local storage
  React.useEffect(() => {
    const updateFavoriteCount = async () => {
      try {
        // This would fetch from your favorites API
        // For now, we'll use localStorage as a fallback
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavoriteCount(favorites.length);
      } catch (error) {
        console.error('Failed to fetch favorite count:', error);
      }
    };

    updateFavoriteCount();
    
    // Listen for favorite changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'favorites') {
        updateFavoriteCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    activeTab,
    setActiveTab,
    favoriteCount,
    setFavoriteCount
  };
}
