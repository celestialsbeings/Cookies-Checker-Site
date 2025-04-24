import React, { lazy, Suspense } from 'react';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="relative">
      <div className="absolute inset-0 rounded-full blur-xl bg-gray-500/20"></div>
      <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-gray-500 border-t-transparent"></div>
    </div>
  </div>
);

// Lazy load the AdComponent
export const LazyAdComponent = lazy(() => import('./CookieCatcher/AdComponent'));

// Wrapper with Suspense
export const AdComponentWithSuspense: React.FC<{
  onAdComplete: () => void;
  onAdError: (error: string) => void;
}> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyAdComponent {...props} />
  </Suspense>
);

// Export other lazy-loaded components as needed
