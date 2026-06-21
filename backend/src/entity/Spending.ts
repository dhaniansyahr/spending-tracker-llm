export const CATEGORIES = [
  "FOOD_DINING",
  "TRANSPORTATION",
  "ENTERTAINMENT",
  "SHOPPING",
  "OTHERS",
] as const

export const SOURCES = ["MANUAL", "FREE_TEXT", "RECEIPT"] as const

export type Category = (typeof CATEGORIES)[number]
export type Source = (typeof SOURCES)[number]

export interface SpendingDAO {
  id: string
  title: string
  amount: number
  category: Category
  source: Source
  note?: string | null
  receiptUrl?: string | null
  rawText?: string | null
  date: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateSpendingDTO {
  title: string
  amount: number
  category: Category
  source?: Source
  note?: string
  receiptUrl?: string
  rawText?: string
  date?: string
}

export interface UpdateSpendingDTO {
  title?: string
  amount?: number
  category?: Category
  note?: string
  date?: string
}

export interface SpendingPreviewEntity {
  title: string
  amount: number
  category: Category
  source: Source
  note?: string
  receiptUrl?: string
  rawText?: string
}

export interface SpendingAnalyzeReceipt {
  url: string
}
