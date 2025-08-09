/**
 * Cache optimizado para servicios API
 * Reduce llamadas redundantes al backend
 */

class ApiCache {
  constructor(ttl = 300000) { // 5 minutos por defecto
    this.cache = new Map();
    this.ttl = ttl;
  }

  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${url}?${JSON.stringify(sortedParams)}`;
  }

  set(key, data) {
    const expiresAt = Date.now() + this.ttl;
    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now()
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  invalidate(pattern) {
    if (typeof pattern === 'string') {
      // Invalidar por clave exacta
      this.cache.delete(pattern);
    } else if (pattern instanceof RegExp) {
      // Invalidar por patrón regex
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  clear() {
    this.cache.clear();
  }

  // Limpiar cache expirado automáticamente
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Estadísticas del cache
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instancia global del cache
const apiCache = new ApiCache();

// Limpiar cache expirado cada 5 minutos
setInterval(() => {
  apiCache.cleanup();
}, 300000);

export default apiCache;
