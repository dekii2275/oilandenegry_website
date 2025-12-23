/**
 * Custom hook để fetch market prices data
 */

import { useState, useEffect } from 'react'
import { marketService } from '@/services/market.service'
import type { MarketPrice } from '@/types/market'

interface UseMarketPricesOptions {
  enabled?: boolean
  onSuccess?: (data: MarketPrice[]) => void
  onError?: (error: any) => void
  refetchInterval?: number // Auto refetch mỗi N ms
}

export function useMarketPrices(options: UseMarketPricesOptions = {}) {
  const { enabled = true, onSuccess, onError, refetchInterval } = options
  
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchPrices = async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await marketService.getMarketPrices()
      setPrices(data)
      onSuccess?.(data)
    } catch (err) {
      setError(err)
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()

    // Auto refetch nếu có interval
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchPrices, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [enabled, refetchInterval])

  return { prices, loading, error, refetch: fetchPrices }
}

