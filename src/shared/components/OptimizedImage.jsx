import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Componente de imagen optimizada con lazy loading y compresión
 */
export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  placeholder = null,
  quality = 80,
  sizes,
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px', // Cargar 50px antes de que sea visible
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleLoad = useCallback((e) => {
    setIsLoaded(true);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e) => {
    setHasError(true);
    onError?.(e);
  }, [onError]);

  // Generar srcSet para responsive images
  const generateSrcSet = (baseSrc) => {
    if (!sizes) return undefined;
    
    const breakpoints = [400, 800, 1200, 1600];
    return breakpoints
      .map(bp => `${baseSrc}?w=${bp}&q=${quality} ${bp}w`)
      .join(', ');
  };

  const imageStyle = {
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease',
    width,
    height,
    objectFit: 'cover'
  };

  const placeholderStyle = {
    width,
    height,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: isLoaded ? 'none' : 'shimmer 1.5s infinite',
    display: isLoaded ? 'none' : 'block'
  };

  return (
    <div 
      ref={imgRef} 
      className={`optimized-image ${className}`}
      style={{ position: 'relative', width, height }}
    >
      {/* Placeholder/Shimmer */}
      {!isLoaded && !hasError && (
        <div style={placeholderStyle}>
          {placeholder}
        </div>
      )}

      {/* Imagen principal */}
      {isInView && !hasError && (
        <img
          src={src}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div 
          style={{
            ...placeholderStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
            color: '#999',
            fontSize: '12px'
          }}
        >
          Error al cargar imagen
        </div>
      )}

      {/* CSS para animación shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};
