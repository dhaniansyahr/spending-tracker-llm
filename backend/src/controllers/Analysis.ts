import { Context, TypedResponse } from "hono"
import * as AnalysisService from "@/services/Analysis.js"
import { handleServiceErrorWithResponse, response_success } from "@/shared/utils/response.utils.js"

export async function getVerdict(c: Context): Promise<TypedResponse> {
  const { dateFrom, dateTo } = await c.req.json() as { dateFrom: string; dateTo: string }
  const serviceResponse = await AnalysisService.getVerdict(dateFrom, dateTo)

  if (!serviceResponse.status) return handleServiceErrorWithResponse(c, serviceResponse)
  return response_success(c, serviceResponse.data, "Successfully generated analysis!")
}
