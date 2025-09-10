// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  loadTime?: number;
  domContentLoaded?: number;
  resourceLoadTime?: number;
  cacheHitRate?: number;
  
  // User experience metrics
  timeToInteractive?: number;
  totalBlockingTime?: number;
  
  // Network metrics
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size?: number;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'other';
  cached: boolean;
}

// Performance observer for Core Web Vitals
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor() {
    this.initializeObservers();
    this.measureNavigationTiming();
    this.measureNetworkInformation();
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.notifyCallbacks();
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.notifyCallbacks();
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.notifyCallbacks();
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
              this.notifyCallbacks();
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }
    }
  }

  private measureNavigationTiming() {
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      
      // Wait for page load to complete
      window.addEventListener('load', () => {
        this.metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
        this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        this.metrics.ttfb = timing.responseStart - timing.navigationStart;
        this.notifyCallbacks();
      });
    }
  }

  private measureNetworkInformation() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.connectionType = connection.type;
      this.metrics.effectiveType = connection.effectiveType;
      this.metrics.downlink = connection.downlink;
      this.metrics.rtt = connection.rtt;
    }
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback(this.metrics));
  }

  public onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {
    this.callbacks.push(callback);
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getResourceTimings(): ResourceTiming[] {
    if (!('performance' in window)) return [];

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.map(resource => {
      const type = this.getResourceType(resource.name);
      const cached = resource.transferSize === 0 && resource.decodedBodySize > 0;
      
      return {
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize,
        type,
        cached
      };
    });
  }

  private getResourceType(url: string): ResourceTiming['type'] {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    return 'other';
  }

  public getCacheHitRate(): number {
    const resources = this.getResourceTimings();
    if (resources.length === 0) return 0;
    
    const cachedResources = resources.filter(r => r.cached).length;
    return (cachedResources / resources.length) * 100;
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.callbacks = [];
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

// Performance optimization utilities
export class PerformanceOptimizer {
  // Preload critical resources
  static preloadResource(href: string, as: string, type?: string) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  }

  // Prefetch resources for next navigation
  static prefetchResource(href: string) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  // DNS prefetch for external domains
  static dnsPrefetch(domain: string) {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  }

  // Preconnect to external domains
  static preconnect(domain: string, crossorigin = false) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    if (crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  // Optimize images for different screen densities
  static generateResponsiveImageSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes
      .map(size => `${baseUrl}?w=${size}&q=75 ${size}w`)
      .join(', ');
  }

  // Generate WebP alternatives
  static generateWebPSrc(src: string): string {
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  // Measure and log performance
  static logPerformanceMetrics() {
    const monitor = getPerformanceMonitor();
    const metrics = monitor.getMetrics();
    const resources = monitor.getResourceTimings();
    
    console.group('🚀 Performance Metrics');
    console.log('Core Web Vitals:', {
      LCP: metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A',
      FID: metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A',
      CLS: metrics.cls ? metrics.cls.toFixed(3) : 'N/A',
      FCP: metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A'
    });
    
    console.log('Load Times:', {
      'Page Load': metrics.loadTime ? `${metrics.loadTime}ms` : 'N/A',
      'DOM Ready': metrics.domContentLoaded ? `${metrics.domContentLoaded}ms` : 'N/A',
      'TTFB': metrics.ttfb ? `${metrics.ttfb}ms` : 'N/A'
    });
    
    console.log('Network:', {
      'Connection': metrics.effectiveType || 'Unknown',
      'Downlink': metrics.downlink ? `${metrics.downlink} Mbps` : 'N/A',
      'RTT': metrics.rtt ? `${metrics.rtt}ms` : 'N/A'
    });
    
    console.log('Resources:', {
      'Total': resources.length,
      'Cached': resources.filter(r => r.cached).length,
      'Cache Hit Rate': `${monitor.getCacheHitRate().toFixed(1)}%`
    });
    
    console.groupEnd();
  }
}

// Bundle splitting utilities
export class BundleOptimizer {
  // Dynamic import with error handling
  static async loadComponent<T>(
    importFn: () => Promise<{ default: T }>,
    fallback?: T
  ): Promise<T> {
    try {
      const module = await importFn();
      return module.default;
    } catch (error) {
      console.error('Failed to load component:', error);
      if (fallback) return fallback;
      throw error;
    }
  }

  // Preload route components
  static preloadRoute(routePath: string) {
    const routes: Record<string, () => Promise<any>> = {
      '/movies': () => import('../pages/Movies'),
      '/shorts': () => import('../pages/Shorts'),
      '/search': () => import('../pages/Search'),
      '/favorites': () => import('../pages/Favorites')
    };

    const importFn = routes[routePath];
    if (importFn) {
      importFn().catch(error => {
        console.warn(`Failed to preload route ${routePath}:`, error);
      });
    }
  }

  // Critical CSS extraction
  static extractCriticalCSS(): string[] {
    const criticalSelectors = [
      // Layout
      'body', 'html', '.container', '.grid',
      // Navigation
      '.nav', '.header', '.footer',
      // Above-the-fold content
      '.hero', '.featured', '.movie-card',
      // Loading states
      '.loading', '.skeleton', '.spinner'
    ];

    return criticalSelectors;
  }
}

// Memory management utilities
export class MemoryOptimizer {
  private static observers = new Set<IntersectionObserver>();
  private static timers = new Set<number>();

  // Clean up observers
  static cleanupObservers() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  // Clean up timers
  static cleanupTimers() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  // Register observer for cleanup
  static registerObserver(observer: IntersectionObserver) {
    this.observers.add(observer);
  }

  // Register timer for cleanup
  static registerTimer(timer: number) {
    this.timers.add(timer);
  }

  // Memory usage monitoring
  static getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  // Clean up on page unload
  static setupCleanup() {
    window.addEventListener('beforeunload', () => {
      this.cleanupObservers();
      this.cleanupTimers();
      
      // Disconnect performance monitor
      if (performanceMonitor) {
        performanceMonitor.disconnect();
        performanceMonitor = null;
      }
    });
  }
}

// Initialize performance monitoring
export function initializePerformanceMonitoring() {
  // Setup memory cleanup
  MemoryOptimizer.setupCleanup();
  
  // Preconnect to external domains
  PerformanceOptimizer.preconnect('https://fonts.googleapis.com');
  PerformanceOptimizer.preconnect('https://fonts.gstatic.com', true);
  
  // DNS prefetch for potential external resources
  PerformanceOptimizer.dnsPrefetch('//images.unsplash.com');
  PerformanceOptimizer.dnsPrefetch('//cdn.jsdelivr.net');
  
  // Log performance metrics in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      PerformanceOptimizer.logPerformanceMetrics();
    }, 3000);
  }
  
  return getPerformanceMonitor();
}

// React hook for performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({});
  
  React.useEffect(() => {
    const monitor = getPerformanceMonitor();
    
    monitor.onMetricsUpdate(setMetrics);
    setMetrics(monitor.getMetrics());
    
    return () => {
      // Cleanup is handled by MemoryOptimizer
    };
  }, []);
  
  return metrics;
}

// Export for global access
declare global {
  interface Window {
    __PERFORMANCE_MONITOR__: PerformanceMonitor;
  }
}

if (typeof window !== 'undefined') {
  window.__PERFORMANCE_MONITOR__ = getPerformanceMonitor();
}
