interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class ApiCache {
  private cache: Map<string, CacheItem<any>>;
  private defaultExpiry: number;

  constructor(defaultExpiryMs = 5 * 60 * 1000) { // Default: 5 minutes
    this.cache = new Map();
    this.defaultExpiry = defaultExpiryMs;
  }

  /**
   * Get an item from the cache
   * @param key Cache key
   * @returns The cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if the item has expired
    if (Date.now() > item.timestamp + item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  /**
   * Set an item in the cache
   * @param key Cache key
   * @param data Data to cache
   * @param expiryMs Expiry time in milliseconds (optional)
   */
  set<T>(key: string, data: T, expiryMs?: number): void {
    const expiry = expiryMs || this.defaultExpiry;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of items in the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean expired items from the cache
   */
  cleanExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp + item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Create a singleton instance
export const apiCache = new ApiCache();

// Helper function for cached fetch
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  expiryMs?: number
): Promise<T> {
  const cacheKey = `${url}-${JSON.stringify(options || {})}`;
  
  // Try to get from cache first
  const cachedData = apiCache.get<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch from API
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json() as T;
  
  // Cache the result
  apiCache.set(cacheKey, data, expiryMs);
  
  return data;
}

export default apiCache;
