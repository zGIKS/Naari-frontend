import { useMemo, useCallback, useState, useEffect } from 'react';

/**
 * Hook optimizado para memoizar servicios pesados y reducir re-renderizados
 */
export const useOptimizedService = (factory, dependencies = []) => {
  // Memoizar la creación del servicio
  const service = useMemo(() => {
    if (!factory) return null;
    return factory;
  }, dependencies);

  // Memoizar funciones comunes del servicio
  const memoizedOperations = useMemo(() => {
    if (!service) return {};

    return {
      getAll: service.getAll?.bind(service),
      getById: service.getById?.bind(service),
      create: service.create?.bind(service),
      update: service.update?.bind(service),
      delete: service.delete?.bind(service)
    };
  }, [service]);

  return {
    service,
    ...memoizedOperations
  };
};

/**
 * Hook para memoizar callbacks pesados
 */
export const useOptimizedCallback = (callback, dependencies = []) => {
  return useCallback(callback, dependencies);
};

/**
 * Hook para debounce optimizado
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
