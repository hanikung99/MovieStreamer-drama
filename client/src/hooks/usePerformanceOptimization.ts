import { useEffect, useState, useCallback, useRef } from 'react';

// Hook for lazy loading images with intersection observer
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current || !src) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, options]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
  }, []);

  return {
    imgRef,
    imageSrc,
    isLoaded,
    isError,
    handleLoad,
    handleError
  };
}

// Hook for detecting network connection quality
export function useNetworkQuality() {
  const [networkQuality, setNetworkQuality] = useState<'slow' | 'fast' | 'unknown'>('unknown');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Detect connection quality using Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateNetworkQuality = () => {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '4g') {
          setNetworkQuality('fast');
        } else if (effectiveType === '3g' || effectiveType === '2g') {
          setNetworkQuality('slow');
        } else {
          setNetworkQuality('unknown');
        }
      };

      updateNetworkQuality();
      connection.addEventListener('change', updateNetworkQuality);

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
        connection.removeEventListener('change', updateNetworkQuality);
      };
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return { networkQuality, isOnline };
}

// Hook for virtual scrolling optimization
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    item,
    index: startIndex + index
  }));

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  };
}

// Hook for debouncing values (useful for search)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for throttling function calls (useful for scroll events)
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    }) as T,
    [callback, delay]
  );
}

// Hook for preloading resources
export function usePreloader() {
  const preloadedResources = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadVideo = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      video.onerror = reject;
      video.preload = 'metadata';
      video.src = src;
    });
  }, []);

  const preloadMultiple = useCallback(async (
    resources: Array<{ type: 'image' | 'video'; src: string }>
  ) => {
    const promises = resources.map(resource => {
      if (resource.type === 'image') {
        return preloadImage(resource.src);
      } else {
        return preloadVideo(resource.src);
      }
    });

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn('Some resources failed to preload:', error);
    }
  }, [preloadImage, preloadVideo]);

  return {
    preloadImage,
    preloadVideo,
    preloadMultiple,
    isPreloaded: (src: string) => preloadedResources.current.has(src)
  };
}

// Hook for memory usage monitoring
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  }>({});

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getMemoryUsagePercentage = useCallback(() => {
    if (memoryInfo.usedJSHeapSize && memoryInfo.jsHeapSizeLimit) {
      return (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
    }
    return 0;
  }, [memoryInfo]);

  const isMemoryHigh = useCallback(() => {
    return getMemoryUsagePercentage() > 80; // Consider high if > 80%
  }, [getMemoryUsagePercentage]);

  return {
    memoryInfo,
    getMemoryUsagePercentage,
    isMemoryHigh
  };
}

// Hook for battery status (mobile optimization)
export function useBatteryStatus() {
  const [batteryInfo, setBatteryInfo] = useState<{
    level?: number;
    charging?: boolean;
    chargingTime?: number;
    dischargingTime?: number;
  }>({});

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryInfo = () => {
          setBatteryInfo({
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          });
        };

        updateBatteryInfo();
        
        battery.addEventListener('chargingchange', updateBatteryInfo);
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingtimechange', updateBatteryInfo);
        battery.addEventListener('dischargingtimechange', updateBatteryInfo);

        return () => {
          battery.removeEventListener('chargingchange', updateBatteryInfo);
          battery.removeEventListener('levelchange', updateBatteryInfo);
          battery.removeEventListener('chargingtimechange', updateBatteryInfo);
          battery.removeEventListener('dischargingtimechange', updateBatteryInfo);
        };
      });
    }
  }, []);

  const isBatteryLow = useCallback(() => {
    return batteryInfo.level !== undefined && batteryInfo.level < 0.2; // < 20%
  }, [batteryInfo.level]);

  const shouldReducePerformance = useCallback(() => {
    return isBatteryLow() && !batteryInfo.charging;
  }, [isBatteryLow, batteryInfo.charging]);

  return {
    batteryInfo,
    isBatteryLow,
    shouldReducePerformance
  };
}
