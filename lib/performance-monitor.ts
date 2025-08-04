// Performance monitoring and optimization utilities

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  metadata?: Record<string, any>
}

interface PerformanceThreshold {
  name: string
  threshold: number
  action: 'warn' | 'error' | 'critical'
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private thresholds: PerformanceThreshold[] = []
  private isEnabled: boolean = process.env.NODE_ENV === 'production'

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  constructor() {
    this.setupThresholds()
    this.startPeriodicCleanup()
  }

  private setupThresholds() {
    this.thresholds = [
      { name: 'api_response_time', threshold: 1000, action: 'warn' },
      { name: 'api_response_time', threshold: 3000, action: 'error' },
      { name: 'api_response_time', threshold: 5000, action: 'critical' },
      { name: 'database_query_time', threshold: 500, action: 'warn' },
      { name: 'database_query_time', threshold: 1000, action: 'error' },
      { name: 'memory_usage', threshold: 80, action: 'warn' },
      { name: 'memory_usage', threshold: 90, action: 'error' },
    ]
  }

  // Track API response time
  trackApiResponse(path: string, method: string, duration: number, statusCode: number) {
    if (!this.isEnabled) return

    const metric: PerformanceMetric = {
      name: 'api_response_time',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        path,
        method,
        statusCode,
      },
    }

    this.addMetric(metric)
    this.checkThresholds(metric)
  }

  // Track database query performance
  trackDatabaseQuery(model: string, action: string, duration: number, query?: string) {
    if (!this.isEnabled) return

    const metric: PerformanceMetric = {
      name: 'database_query_time',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        model,
        action,
        query: query?.substring(0, 100), // Truncate long queries
      },
    }

    this.addMetric(metric)
    this.checkThresholds(metric)
  }

  // Track memory usage
  trackMemoryUsage() {
    if (!this.isEnabled) return

    const usage = process.memoryUsage()
    const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100

    const metric: PerformanceMetric = {
      name: 'memory_usage',
      value: heapUsedPercent,
      unit: '%',
      timestamp: Date.now(),
      metadata: {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
        rss: usage.rss,
      },
    }

    this.addMetric(metric)
    this.checkThresholds(metric)
  }

  // Track React component render time
  trackComponentRender(componentName: string, duration: number, props?: any) {
    if (!this.isEnabled) return

    const metric: PerformanceMetric = {
      name: 'component_render_time',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        component: componentName,
        props: props ? Object.keys(props) : [],
      },
    }

    this.addMetric(metric)
  }

  // Track bundle size
  trackBundleSize(bundleName: string, size: number) {
    if (!this.isEnabled) return

    const metric: PerformanceMetric = {
      name: 'bundle_size',
      value: size,
      unit: 'bytes',
      timestamp: Date.now(),
      metadata: {
        bundle: bundleName,
      },
    }

    this.addMetric(metric)
  }

  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  private checkThresholds(metric: PerformanceMetric) {
    const relevantThresholds = this.thresholds.filter(t => t.name === metric.name)
    
    for (const threshold of relevantThresholds) {
      if (metric.value > threshold.threshold) {
        this.handleThresholdExceeded(threshold, metric)
      }
    }
  }

  private handleThresholdExceeded(threshold: PerformanceThreshold, metric: PerformanceMetric) {
    const message = `Performance threshold exceeded: ${threshold.name} = ${metric.value}${metric.unit} (threshold: ${threshold.threshold}${metric.unit})`
    
    switch (threshold.action) {
      case 'warn':
        console.warn(`[PERF WARN] ${message}`, metric.metadata)
        break
      case 'error':
        console.error(`[PERF ERROR] ${message}`, metric.metadata)
        break
      case 'critical':
        console.error(`[PERF CRITICAL] ${message}`, metric.metadata)
        // Could trigger alerts, scaling, etc.
        break
    }
  }

  // Get performance statistics
  getStats(timeWindow: number = 60000): Record<string, any> {
    const now = Date.now()
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < timeWindow)
    
    const stats: Record<string, any> = {}
    
    // Group by metric name
    const grouped = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = []
      }
      acc[metric.name].push(metric)
      return acc
    }, {} as Record<string, PerformanceMetric[]>)
    
    // Calculate statistics for each metric type
    for (const [name, metrics] of Object.entries(grouped)) {
      const values = metrics.map(m => m.value)
      stats[name] = {
        count: values.length,
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        p95: this.calculatePercentile(values, 95),
        p99: this.calculatePercentile(values, 99),
      }
    }
    
    return stats
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index] || 0
  }

  private startPeriodicCleanup() {
    if (!this.isEnabled) return

    // Clean up old metrics every 5 minutes
    setInterval(() => {
      const oneHourAgo = Date.now() - (60 * 60 * 1000)
      this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo)
    }, 5 * 60 * 1000)

    // Track memory usage every 30 seconds
    setInterval(() => {
      this.trackMemoryUsage()
    }, 30 * 1000)
  }

  // Performance optimization utilities
  debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }) as T
  }

  throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let inThrottle: boolean
    return ((...args: any[]) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }) as T
  }

  // Cache with TTL
  createCache<T>(ttl: number = 300000) {
    const cache = new Map<string, { data: T; timestamp: number }>()
    
    return {
      get: (key: string): T | null => {
        const item = cache.get(key)
        if (!item) return null
        
        if (Date.now() - item.timestamp > ttl) {
          cache.delete(key)
          return null
        }
        
        return item.data
      },
      set: (key: string, data: T): void => {
        cache.set(key, { data, timestamp: Date.now() })
      },
      clear: (): void => {
        cache.clear()
      },
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// React performance hooks
export function usePerformanceTracking(componentName: string) {
  const startTime = React.useRef<number>(0)
  
  React.useEffect(() => {
    startTime.current = performance.now()
    
    return () => {
      const duration = performance.now() - startTime.current
      performanceMonitor.trackComponentRender(componentName, duration)
    }
  })
}

// API performance wrapper
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  func: T,
  name: string
): T {
  return ((...args: any[]) => {
    const startTime = performance.now()
    
    try {
      const result = func(...args)
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - startTime
          performanceMonitor.trackApiResponse(name, 'async', duration, 200)
        })
      } else {
        const duration = performance.now() - startTime
        performanceMonitor.trackApiResponse(name, 'sync', duration, 200)
        return result
      }
    } catch (error) {
      const duration = performance.now() - startTime
      performanceMonitor.trackApiResponse(name, 'error', duration, 500)
      throw error
    }
  }) as T
} 