import { Context, TypedResponse } from "hono"
import * as StorageService from "@/services/Storage.js"
import { handleServiceErrorWithResponse, response_created } from "@/shared/utils/response.utils.js"

export async function upload(c: Context): Promise<TypedResponse> {
  const body = await c.req.parseBody()
  const file = body["file"]

  if (!file || typeof file === "string") {
    return c.json({ status: false, message: "No file uploaded" }, 400)
  }

  const buffer = await file.arrayBuffer()
  const serviceResponse = await StorageService.upload(buffer, file.type)

  if (!serviceResponse.status) return handleServiceErrorWithResponse(c, serviceResponse)
  return response_created(c, serviceResponse.data, "Successfully uploaded file!")
}
