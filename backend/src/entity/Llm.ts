import type { Category } from "./Spending.js"

export interface LLMSpendingOutput {
  title: string
  amount: number
  category: Category
  note?: string
}

export interface LLMAnalysisOutput {
  verdict: string
  insights: [string, string, string]
  recommendations: [string, string, string]
}

export interface SpendingSummaryDTO {
  totalAmount: number
  byCategory: Record<string, number>
  topSpendings: Array<{ title: string; amount: number; category: string }>
  dateFrom: string
  dateTo: string
}

export interface VerdictDTO extends LLMAnalysisOutput {
  totalAmount: number;
  byCategory: Record<string, number>
}
