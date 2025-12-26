/**
 * Custom hook để fetch news data
 */

import { useState, useEffect } from 'react'
import { newsService } from '@/services/news.service'
import type { NewsItem, NewsListParams } from '@/types/news'

interface UseNewsOptions extends NewsListParams {
  enabled?: boolean
  onSuccess?: (data: NewsItem[]) => void
  onError?: (error: any) => void
}

export function useNews(options: UseNewsOptions = {}) {
  const { enabled = true, onSuccess, onError, ...params } = options
  
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await newsService.getNews(params)
        const data = response.data || []
        setNews(data)
        onSuccess?.(data)
      } catch (err) {
        setError(err)
        onError?.(err)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [enabled, JSON.stringify(params)])

  return { news, loading, error }
}

/**
 * Hook để lấy tin tức mới nhất
 */
export function useLatestNews(limit: number = 3) {
  return useNews({ limit, sort_by: 'created_at', order: 'desc' })
}

