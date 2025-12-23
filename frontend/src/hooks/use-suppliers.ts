/**
 * Custom hook để fetch suppliers data
 */

import { useState, useEffect } from 'react'
import { suppliersService } from '@/services/suppliers.service'
import type { Supplier } from '@/types/supplier'

interface UseSuppliersOptions {
  enabled?: boolean
  verified?: boolean
  onSuccess?: (data: Supplier[]) => void
  onError?: (error: any) => void
}

export function useSuppliers(options: UseSuppliersOptions = {}) {
  const { enabled = true, verified = false, onSuccess, onError } = options
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    const fetchSuppliers = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = verified 
          ? await suppliersService.getVerifiedSuppliers()
          : await suppliersService.getSuppliers()
        setSuppliers(data)
        onSuccess?.(data)
      } catch (err) {
        setError(err)
        onError?.(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [enabled, verified])

  return { suppliers, loading, error }
}

