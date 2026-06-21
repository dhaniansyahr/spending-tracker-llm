import { Context, Next } from "hono"
import * as Helpers from "@/shared/validations/helper.js"
import { response_bad_request } from "@/shared/utils/response.utils.js"
import { CreateSpendingSchema, UpdateSpendingSchema, AnalyzeTextSchema } from "./schema.js"

export async function validateCreateSpending(c: Context, next: Next) {
  const data = await c.req.json()
  const invalidFields = Helpers.validateSchema(CreateSpendingSchema, data)
  if (invalidFields.length > 0) return response_bad_request(c, "Bad Request", invalidFields)
  await next()
}

export async function validateUpdateSpending(c: Context, next: Next) {
  const data = await c.req.json()
  const invalidFields = Helpers.validateSchema(UpdateSpendingSchema, data)
  if (invalidFields.length > 0) return response_bad_request(c, "Bad Request", invalidFields)
  await next()
}

export async function validateAnalyzeText(c: Context, next: Next) {
  const data = await c.req.json()
  const invalidFields = Helpers.validateSchema(AnalyzeTextSchema, data)
  if (invalidFields.length > 0) return response_bad_request(c, "Bad Request", invalidFields)
  await next()
}
