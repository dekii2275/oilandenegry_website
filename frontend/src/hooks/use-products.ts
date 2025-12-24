/**
 * Custom hook để fetch products data
 */

import { useState, useEffect } from 'react'
import { productsService } from '@/services/products.service'
import type { Product, ProductListParams } from '@/types/product'

interface UseProductsOptions extends ProductListParams {
  enabled?: boolean
  onSuccess?: (data: Product[]) => void
  onError?: (error: any) => void
}

export function useProducts(options: UseProductsOptions = {}) {
  const { enabled = true, onSuccess, onError, ...params } = options
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await productsService.getProducts(params)
        const data = response.data || []
        setProducts(data)
        onSuccess?.(data)
      } catch (err) {
        setError(err)
        onError?.(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [enabled, JSON.stringify(params)])

  return { products, loading, error, refetch: () => {
    // Trigger refetch bằng cách thay đổi dependency
    setLoading(true)
  } }
}

