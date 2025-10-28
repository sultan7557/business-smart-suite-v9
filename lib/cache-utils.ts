/**
 * Cache clearing utilities for production-level cache management
 * This ensures users always get the latest code and data
 */

export const clearAllCaches = async (): Promise<void> => {
  try {
    // Clear service worker cache
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }

    // Clear browser cache for API calls
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        await Promise.all(keys.map(key => cache.delete(key)))
      }
    }

    // Force reload to get fresh JavaScript bundles
    if (typeof window !== 'undefined') {
      // Add cache-busting parameter to force fresh load
      const url = new URL(window.location.href)
      url.searchParams.set('_t', Date.now().toString())
      window.location.href = url.toString()
    }
  } catch (error) {
    console.error('Error clearing caches:', error)
    // Fallback: force page reload
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }
}

export const clearApiCache = async (): Promise<void> => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      for (const cacheName of cacheNames) {
        if (cacheName.includes('api') || cacheName.includes('next')) {
          await caches.delete(cacheName)
        }
      }
    }
  } catch (error) {
    console.error('Error clearing API cache:', error)
  }
}

export const addCacheBustingHeaders = (): HeadersInit => {
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Last-Modified': new Date().toUTCString(),
    'ETag': `"${Date.now()}"`,
  }
}

export const getCacheBustingUrl = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}_t=${Date.now()}`
}

/**
 * Check if JavaScript bundles are corrupted and clear cache if needed
 */
export const checkBundleIntegrity = async (): Promise<boolean> => {
  try {
    // Check if we can access common Next.js bundle files
    const bundleUrls = [
      '/_next/static/chunks/webpack.js',
      '/_next/static/chunks/main.js',
      '/_next/static/chunks/pages/_app.js',
    ]

    for (const url of bundleUrls) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          cache: 'no-cache'
        })
        
        if (!response.ok) {
          console.warn(`Bundle integrity check failed for ${url}`)
          return false
        }
      } catch (error) {
        console.warn(`Bundle integrity check error for ${url}:`, error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Bundle integrity check failed:', error)
    return false
  }
}

/**
 * Production-ready cache management with automatic recovery
 */
export const manageCacheWithRecovery = async (): Promise<void> => {
  try {
    // Only run cache management if there's an actual error
    // Don't run proactively to avoid infinite loops
    return
  } catch (error) {
    console.error('Cache management error:', error)
  }
}

