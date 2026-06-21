import { Hono } from "hono"
import * as StorageController from "@/controllers/Storage.js"

export const storageRoute = new Hono()

storageRoute.post("/upload", StorageController.upload)
