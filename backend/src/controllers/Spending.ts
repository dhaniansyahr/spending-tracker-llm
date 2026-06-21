import { Context, TypedResponse } from "hono"
import * as EzFilter from "@nodewave/prisma-ezfilter"
import * as SpendingService from "@/services/Spending.js"
import { handleServiceErrorWithResponse, response_success, response_created } from "@/shared/utils/response.utils.js"
import { CreateSpendingDTO, SpendingAnalyzeReceipt, UpdateSpendingDTO } from "@/entity/Spending"

export async function getAll(c: Context): Promise<TypedResponse> {
  const filters: EzFilter.FilteringQuery = EzFilter.extractQueryFromParams(c.req.query())
  const serviceResponse = await SpendingService.getAll(filters)

  if (!serviceResponse.status) return handleServiceErrorWithResponse(c, serviceResponse)
  return response_success(c, serviceResponse.data, "Successfully fetched all Spendings!")
}

export async function getById(c: Context): Promise<TypedResponse> {
  const id = c.req.param("id") as string
  const serviceResponse = await SpendingService.getById(id)

  if (!serviceResponse.status) return handleServiceErrorWithResponse(c, serviceResponse)
  return response_success(c, serviceResponse.data, "Successfully fetched Spending!")
}

export async function create(c: Context): Promise<TypedResponse> {
  const data: CreateSpendingDTO = await c.req.json()
  const serviceResponse = await SpendingService.create(data)

  if (!serviceResponse.status) return handleServiceErrorWithResponse(c, serviceResponse)
  return response_created(c, serviceResponse.data, "Successfully created new Spending!")
}

export async function update(c: Context): Promise<TypedResponse> {
  const data: UpdateSpendingDTO = await c.req.json()
  const id = c.req.param("id") as string

  const serviceResponse = await SpendingService.update(id, data)

  if (!serviceResponse.status) return handleServiceErrorWithResponse(c, serviceResponse)
  return response_success(c, serviceResponse.data, "Successfully updated Spending!")
}

export async function deleteById(c: Context): Promise<TypedResponse> {
  const id = c.req.param("id") as string
  const serviceResponse = await SpendingService.deleteById(id)

  if (!serviceResponse.status) return handleServiceErrorWithResponse(c, serviceResponse)
  return response_success(c, serviceResponse.data, "Successfully deleted Spending!")
}

export async function analyzeText(c: Context): Promise<TypedResponse> {
  const { text } = await c.req.json() as { text: string }
  const serviceResponse = await SpendingService.analyzeTextPreview(text)

  if (!serviceResponse.status) return handleServiceErrorWithResponse(c, serviceResponse)
  return response_success(c, serviceResponse.data, "Successfully analyzed text!")
}

export async function analyzeReceipt(c: Context): Promise<TypedResponse> {
  const data: SpendingAnalyzeReceipt = await c.req.json()

  const serviceResponse = await SpendingService.analyzeReceiptPreview(data)

  if (!serviceResponse.status) return handleServiceErrorWithResponse(c, serviceResponse)
  return response_success(c, serviceResponse.data, "Successfully analyzed receipt!")
}
