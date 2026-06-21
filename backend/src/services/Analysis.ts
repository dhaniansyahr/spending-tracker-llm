import * as AnalysisRepository from "@/repository/Analysis.js"
import * as LLMService from "@/pkg/openrouter/index.js"
import type { ServiceResponse } from "@/shared/entities/service.entity.js"
import {
  HandleServiceResponseSuccess,
  HandleServiceResponseCustomError,
  INTERNAL_SERVER_ERROR_SERVICE_RESPONSE,
  ResponseStatus,
} from "@/shared/entities/service.entity.js"

import Logger from "@/pkg/logger/index.js"
import { VerdictDTO } from "@/entity/Llm"

export async function getVerdict(dateFrom: string, dateTo: string): Promise<ServiceResponse<VerdictDTO | {}>> {
  try {
    const spendings = await AnalysisRepository.getByDateRange(dateFrom, dateTo)

    if (spendings.length === 0) {
      return HandleServiceResponseCustomError("No spendings found in this date range", ResponseStatus.UNPROCESSABLE)
    }

    const totalAmount = spendings.reduce((s, x) => s + Number(x.amount), 0)

    const byCategory: Record<string, number> = {}

    for (const s of spendings) {
      byCategory[s.category] = (byCategory[s.category] ?? 0) + Number(s.amount)
    }
    const topSpendings = spendings.slice(0, 5).map((s) => ({
      title: s.title,
      amount: Number(s.amount),
      category: s.category,
    }))

    const verdict = await LLMService.generateVerdict({ totalAmount, byCategory, topSpendings, dateFrom, dateTo })

    const result: VerdictDTO = {
      totalAmount,
      byCategory,
      verdict: verdict.verdict,
      insights: verdict.insights,
      recommendations: verdict.recommendations
    }

    return HandleServiceResponseSuccess(result)
  } catch (err) {
    Logger.error("AnalysisService.getVerdict", { error: err })
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
  }
}
