import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIiAvPjwvc3ZnPg=='
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);

  useEffect(() => {
    // Create a new image object
    const img = new Image();
    img.src = src;
    
    // When the image loads, update state
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
    
    // Handle errors
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      // Keep the placeholder
    };
    
    return () => {
      // Clean up
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-50'} ${className}`}
      loading="lazy"
    />
  );
};

export default OptimizedImage;
