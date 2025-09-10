import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { InstallPrompt, InstallBanner } from './InstallPrompt';
import { PWAStatusIndicator } from './PWAStatus';

interface PWAContextType {
  showInstallPrompt: () => void;
  hideInstallPrompt: () => void;
  showInstallBanner: () => void;
  hideInstallBanner: () => void;
  isPromptVisible: boolean;
  isBannerVisible: boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function usePWAContext() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
}

interface PWAProviderProps {
  children: React.ReactNode;
  autoShowInstallPrompt?: boolean;
  autoShowInstallBanner?: boolean;
  installPromptDelay?: number;
  installBannerDelay?: number;
}

export function PWAProvider({ 
  children, 
  autoShowInstallPrompt = true,
  autoShowInstallBanner = true,
  installPromptDelay = 30000, // 30 seconds
  installBannerDelay = 10000,  // 10 seconds
}: PWAProviderProps) {
  const { isInstallable, isInstalled } = usePWA();
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);
  const [hasShownBanner, setHasShownBanner] = useState(false);

  // Auto-show install prompt after delay
  useEffect(() => {
    if (!autoShowInstallPrompt || !isInstallable || isInstalled || hasShownPrompt) {
      return;
    }

    // Check if user has dismissed the prompt recently
    const dismissedAt = localStorage.getItem('pwa-install-prompt-dismissed');
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt);
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedTime.getTime()) / (1000 * 60 * 60 * 24);
      
      // Don't show again for 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const timer = setTimeout(() => {
      setIsPromptVisible(true);
      setHasShownPrompt(true);
    }, installPromptDelay);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, autoShowInstallPrompt, installPromptDelay, hasShownPrompt]);

  // Auto-show install banner after delay (mobile only)
  useEffect(() => {
    if (!autoShowInstallBanner || !isInstallable || isInstalled || hasShownBanner) {
      return;
    }

    // Only show banner on mobile
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      return;
    }

    // Check if user has dismissed the banner recently
    const dismissedAt = localStorage.getItem('pwa-install-banner-dismissed');
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt);
      const now = new Date();
      const hoursSinceDismissed = (now.getTime() - dismissedTime.getTime()) / (1000 * 60 * 60);
      
      // Don't show again for 24 hours
      if (hoursSinceDismissed < 24) {
        return;
      }
    }

    const timer = setTimeout(() => {
      setIsBannerVisible(true);
      setHasShownBanner(true);
    }, installBannerDelay);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, autoShowInstallBanner, installBannerDelay, hasShownBanner]);

  const showInstallPrompt = () => {
    setIsPromptVisible(true);
  };

  const hideInstallPrompt = () => {
    setIsPromptVisible(false);
    localStorage.setItem('pwa-install-prompt-dismissed', new Date().toISOString());
  };

  const showInstallBanner = () => {
    setIsBannerVisible(true);
  };

  const hideInstallBanner = () => {
    setIsBannerVisible(false);
    localStorage.setItem('pwa-install-banner-dismissed', new Date().toISOString());
  };

  const contextValue: PWAContextType = {
    showInstallPrompt,
    hideInstallPrompt,
    showInstallBanner,
    hideInstallBanner,
    isPromptVisible,
    isBannerVisible,
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
      
      {/* Install Prompt Modal */}
      {isPromptVisible && (
        <InstallPrompt onClose={hideInstallPrompt} />
      )}
      
      {/* Install Banner (Mobile) */}
      {isBannerVisible && (
        <InstallBanner onClose={hideInstallBanner} />
      )}
    </PWAContext.Provider>
  );
}

// PWA Status Bar Component
export function PWAStatusBar({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-between p-2 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-300">MovieStreamer</span>
      </div>
      
      <PWAStatusIndicator />
    </div>
  );
}

// PWA Update Notification
export function PWAUpdateNotification() {
  const { isUpdateAvailable, skipWaiting } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable) {
      setIsVisible(true);
    }
  }, [isUpdateAvailable]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      skipWaiting();
      // The page will reload automatically when the new service worker takes control
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !isUpdateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96">
      <div className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm">
              Update Available
            </h3>
            <p className="text-white/90 text-xs mt-1">
              A new version of MovieStreamer is ready to install.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="rounded-lg p-1 text-white/80 hover:bg-white/20 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDismiss}
            className="flex-1 rounded-lg bg-white/20 px-3 py-2 text-xs font-medium text-white hover:bg-white/30 transition-colors"
          >
            Later
          </button>
          
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-medium text-blue-600 hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            {isUpdating ? (
              <div className="flex items-center justify-center gap-1">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                Updating...
              </div>
            ) : (
              'Update Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// PWA Offline Indicator
export function PWAOfflineIndicator() {
  const { isOffline } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setIsVisible(true);
    } else {
      // Hide after a delay when back online
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-40 sm:left-auto sm:right-4 sm:w-80">
      <div className={`rounded-xl p-3 shadow-lg transition-all duration-300 ${
        isOffline 
          ? 'bg-gradient-to-r from-red-500 to-pink-600' 
          : 'bg-gradient-to-r from-green-500 to-emerald-600'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            isOffline ? 'bg-white' : 'bg-white animate-pulse'
          }`} />
          
          <span className="text-white text-sm font-medium">
            {isOffline ? 'You\'re offline' : 'Back online'}
          </span>
          
          {!isOffline && (
            <svg className="h-4 w-4 text-white ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        
        {isOffline && (
          <p className="text-white/90 text-xs mt-1">
            Cached content is still available
          </p>
        )}
      </div>
    </div>
  );
}
