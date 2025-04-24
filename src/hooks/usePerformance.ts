import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  FCP: number | null; // First Contentful Paint
  LCP: number | null; // Largest Contentful Paint
  FID: number | null; // First Input Delay
  CLS: number | null; // Cumulative Layout Shift
}

export const usePerformance = (): PerformanceMetrics => {
  const metrics = useRef<PerformanceMetrics>({
    FCP: null,
    LCP: null,
    FID: null,
    CLS: null
  });

  useEffect(() => {
    // Only run in production and if the browser supports the Performance API
    if (process.env.NODE_ENV !== 'production' || !('PerformanceObserver' in window)) {
      return;
    }

    // First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const fcp = entries[0];
          metrics.current.FCP = fcp.startTime;
          console.log(`FCP: ${fcp.startTime}ms`);
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.error('FCP observer error:', e);
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.current.LCP = lastEntry.startTime;
        console.log(`LCP: ${lastEntry.startTime}ms`);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.error('LCP observer error:', e);
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const firstInput = entries[0];
          metrics.current.FID = firstInput.processingStart - firstInput.startTime;
          console.log(`FID: ${metrics.current.FID}ms`);
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.error('FID observer error:', e);
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      let clsEntries: PerformanceEntry[] = [];
      
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        entries.forEach(entry => {
          // Only count layout shifts without recent user input
          if (!(entry as any).hadRecentInput) {
            const value = (entry as any).value;
            clsValue += value;
            clsEntries.push(entry);
            metrics.current.CLS = clsValue;
            console.log(`CLS updated: ${clsValue}`);
          }
        });
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.error('CLS observer error:', e);
    }

    return () => {
      // Clean up observers if needed
      // Note: PerformanceObserver doesn't have a standard disconnect method in all browsers
    };
  }, []);

  return metrics.current;
};

export default usePerformance;
