import { Context, Next } from "hono"
import * as Helpers from "@/shared/validations/helper.js"
import { response_bad_request } from "@/shared/utils/response.utils.js"
import { AnalysisVerdictSchema } from "./schema.js"

export async function validateAnalysisVerdict(c: Context, next: Next) {
  const data = await c.req.json()
  const invalidFields = Helpers.validateSchema(AnalysisVerdictSchema, data)

  if (invalidFields.length > 0) return response_bad_request(c, "Bad Request", invalidFields)
  await next()
}
