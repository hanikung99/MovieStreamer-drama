import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

interface PWAActions {
  install: () => Promise<boolean>;
  skipWaiting: () => void;
  checkForUpdates: () => Promise<void>;
}

export function usePWA(): PWAState & PWAActions {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    isUpdateAvailable: false,
    installPrompt: null,
  });

  // Check if app is installed
  const checkInstallStatus = useCallback(() => {
    const isInstalled = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone === true;
    
    setState(prev => ({ ...prev, isInstalled }));
  }, []);

  // Handle install prompt
  const handleBeforeInstallPrompt = useCallback((e: Event) => {
    e.preventDefault();
    const installPrompt = e as BeforeInstallPromptEvent;
    
    setState(prev => ({
      ...prev,
      isInstallable: true,
      installPrompt,
    }));
  }, []);

  // Handle app installed
  const handleAppInstalled = useCallback(() => {
    setState(prev => ({
      ...prev,
      isInstallable: false,
      isInstalled: true,
      installPrompt: null,
    }));
  }, []);

  // Handle online/offline status
  const handleOnline = useCallback(() => {
    setState(prev => ({ ...prev, isOffline: false }));
  }, []);

  const handleOffline = useCallback(() => {
    setState(prev => ({ ...prev, isOffline: true }));
  }, []);

  // Install the app
  const install = useCallback(async (): Promise<boolean> => {
    if (!state.installPrompt) {
      return false;
    }

    try {
      await state.installPrompt.prompt();
      const choiceResult = await state.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setState(prev => ({
          ...prev,
          isInstallable: false,
          installPrompt: null,
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }, [state.installPrompt]);

  // Skip waiting for service worker update
  const skipWaiting = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
  }, []);

  // Check for service worker updates
  const checkForUpdates = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }
  }, []);

  // Handle service worker updates
  const handleServiceWorkerUpdate = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, isUpdateAvailable: true }));
              }
            });
          }
        });
      });
    }
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('Service Worker registered:', registration);

        // Check for updates immediately
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, isUpdateAvailable: true }));
              }
            });
          }
        });

        // Check for updates every 30 minutes
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Install status
    checkInstallStatus();

    // Install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Network status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Service worker
    handleServiceWorkerUpdate();
    registerServiceWorker();

    // Display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => checkInstallStatus();
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, [
    checkInstallStatus,
    handleBeforeInstallPrompt,
    handleAppInstalled,
    handleOnline,
    handleOffline,
    handleServiceWorkerUpdate,
    registerServiceWorker,
  ]);

  return {
    ...state,
    install,
    skipWaiting,
    checkForUpdates,
  };
}

// Hook for push notifications
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);
        return existingSubscription;
      }

      // You would need to replace this with your actual VAPID public key
      const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || '';
      
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return null;
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      setSubscription(newSubscription);
      return newSubscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      return true;
    }

    try {
      const result = await subscription.unsubscribe();
      if (result) {
        setSubscription(null);
      }
      return result;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }, [subscription]);

  useEffect(() => {
    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check existing subscription
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  return {
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

// Hook for offline storage
export function useOfflineStorage() {
  const [isSupported, setIsSupported] = useState(false);
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null);

  const checkSupport = useCallback(() => {
    const supported = 'caches' in window && 'indexedDB' in window;
    setIsSupported(supported);
  }, []);

  const getStorageUsage = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        setUsage({
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
        });
      } catch (error) {
        console.error('Error getting storage usage:', error);
      }
    }
  }, []);

  const clearCache = useCallback(async (): Promise<boolean> => {
    if (!('caches' in window)) {
      return false;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      await getStorageUsage();
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }, [getStorageUsage]);

  useEffect(() => {
    checkSupport();
    getStorageUsage();
  }, [checkSupport, getStorageUsage]);

  return {
    isSupported,
    usage,
    clearCache,
    refreshUsage: getStorageUsage,
  };
}
