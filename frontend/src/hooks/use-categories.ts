/**
 * Custom hook để fetch categories data
 */

import { useState, useEffect } from 'react'
import { categoriesService } from '@/services/categories.service'
import type { Category } from '@/types/category'

interface UseCategoriesOptions {
  enabled?: boolean
  onSuccess?: (data: Category[]) => void
  onError?: (error: any) => void
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const { enabled = true, onSuccess, onError } = options
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await categoriesService.getCategories()
        setCategories(data)
        onSuccess?.(data)
      } catch (err) {
        setError(err)
        onError?.(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [enabled])

  return { categories, loading, error }
}

