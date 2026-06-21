import * as EzFilter from "@nodewave/prisma-ezfilter"
import * as SpendingRepository from "@/repository/Spending.js"
import * as LLMService from "@/pkg/openrouter/index.js"
import type { CreateSpendingDTO, UpdateSpendingDTO, SpendingPreviewEntity, SpendingAnalyzeReceipt } from "@/entity/Spending.js"
import type { ServiceResponse } from "@/shared/entities/service.entity.js"
import {
  HandleServiceResponseCustomError,
  HandleServiceResponseSuccess,
  INTERNAL_SERVER_ERROR_SERVICE_RESPONSE,
  INVALID_ID_SERVICE_RESPONSE,
} from "@/shared/entities/service.entity.js"
import Logger from "@/pkg/logger/index.js"
import { Spending } from "@prisma/client"
export async function getAll(filters: EzFilter.FilteringQuery): Promise<ServiceResponse<EzFilter.PaginatedResult<Spending[]> | {}>> {
  try {
    const data = await SpendingRepository.getAll(filters)

    return HandleServiceResponseSuccess(data)
  } catch (err) {
    Logger.error("[SERVICE] Spending.getAll", { error: err })
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
  }
}

export async function getById(id: string): Promise<ServiceResponse<Spending | {}>> {
  try {
    const spending = await SpendingRepository.getById(id)

    if (!spending) return INVALID_ID_SERVICE_RESPONSE

    return HandleServiceResponseSuccess(spending)
  } catch (err) {
    Logger.error("[SERVICE] Spending.getById", { error: err })
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
  }
}

export async function create(data: CreateSpendingDTO): Promise<ServiceResponse<Spending | {}>> {
  try {
    const spending = await SpendingRepository.create(data)

    return HandleServiceResponseSuccess(spending)
  } catch (err) {
    Logger.error("[SERVICE] Spending.create", { error: err })
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
  }
}

export async function update(id: string, data: UpdateSpendingDTO): Promise<ServiceResponse<Spending | {}>> {
  try {
    const existing = await SpendingRepository.getById(id)

    if (!existing) return INVALID_ID_SERVICE_RESPONSE

    const updated = await SpendingRepository.update(id, data)

    return HandleServiceResponseSuccess(updated)
  } catch (err) {
    Logger.error("[SERVICE] Spending.update", { error: err })
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
  }
}

export async function deleteById(id: string): Promise<ServiceResponse<{}>> {
  try {
    const existing = await SpendingRepository.getById(id)

    if (!existing) return INVALID_ID_SERVICE_RESPONSE

    await SpendingRepository.deleteById(id)

    return HandleServiceResponseSuccess({})
  } catch (err) {
    Logger.error("[SERVICE] Spending.deleteById", { error: err })
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
  }
}

export async function analyzeTextPreview(text: string): Promise<ServiceResponse<SpendingPreviewEntity | {}>> {
  try {
    const llmResult = await LLMService.analyzeText(text)

    if (!llmResult) return HandleServiceResponseCustomError("LLM Service error!", 400)

    const result: SpendingPreviewEntity = {
      title: llmResult.title ,
      amount: llmResult.amount,
      category: llmResult.category,
      note: llmResult.note,
      source: "FREE_TEXT",
      rawText: text
    }

    return HandleServiceResponseSuccess(result)
  } catch (err) {
    Logger.error("[SERVICE] Spending.analyzeTextPreview", { error: err })
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
  }
}

export async function analyzeReceiptPreview(data: SpendingAnalyzeReceipt): Promise<ServiceResponse<SpendingPreviewEntity | {}>> {
  try {
    const llmResult = await LLMService.analyzeReceipt(data.url)

    if (!llmResult) return HandleServiceResponseCustomError("LLM Service error!", 400)

    const result: SpendingPreviewEntity = {
      title: llmResult.title ,
      amount: llmResult.amount,
      category: llmResult.category,
      note: llmResult.note,
      source: "RECEIPT",
    }
    return HandleServiceResponseSuccess(result)
  } catch (err) {
    Logger.error("SpendingService.analyzeReceiptPreview", { error: err })
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
  }
}
