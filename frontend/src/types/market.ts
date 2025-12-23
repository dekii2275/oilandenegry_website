/**
 * Market Data Types
 */

export interface MarketPrice {
  id: number | string
  name: string
  symbol?: string
  price: string | number
  change: string
  change_percent?: string
  is_positive: boolean
  unit?: string
  updated_at?: string
}

export interface MarketTrend {
  id: number | string
  name: string
  data: Array<{
    date: string
    value: number
  }>
}

export interface MarketDataResponse {
  prices?: MarketPrice[]
  trends?: MarketTrend[]
  updated_at?: string
}

