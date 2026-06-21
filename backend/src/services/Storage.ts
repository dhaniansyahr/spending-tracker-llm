import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { ServiceResponse } from "@/shared/entities/service.entity.js"
import {
  HandleServiceResponseSuccess,
  INTERNAL_SERVER_ERROR_SERVICE_RESPONSE,
} from "@/shared/entities/service.entity.js"
import Logger from "@/pkg/logger/index.js"
import { ulid } from "ulid"

const STORAGE_DIR = process.env.STORAGE_DIR ?? "./storage/receipts"

export interface StoredReceipt {
  url: string
  mimeType: string
}

export async function upload(buffer: ArrayBuffer, mimeType: string): Promise<ServiceResponse<StoredReceipt | {}>> {
  try {
    await mkdir(STORAGE_DIR, { recursive: true })

    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg"
    const filename = `${ulid()}.${ext}`
    const backendUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.BACKEND_PORT ?? 3001}`

    await writeFile(join(STORAGE_DIR, filename), new Uint8Array(buffer))

    return HandleServiceResponseSuccess({
      url: `${backendUrl}/storage/receipts/${filename}`,
      mimeType,
    })
  } catch (err) {
    Logger.error("StorageService.saveReceipt", { error: err })

    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
  }
}
