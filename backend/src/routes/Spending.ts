import { Hono } from "hono"
import * as SpendingController from "@/controllers/Spending.js"
import * as SpendingValidation from "@/validation/spending/validation.js"

export const spendingRoute = new Hono()

spendingRoute.get("/", SpendingController.getAll)
spendingRoute.get("/:id", SpendingController.getById)
spendingRoute.post("/", SpendingValidation.validateCreateSpending, SpendingController.create)
spendingRoute.put("/:id", SpendingValidation.validateUpdateSpending, SpendingController.update)
spendingRoute.delete("/:id", SpendingController.deleteById)
spendingRoute.post("/analyze-text", SpendingValidation.validateAnalyzeText, SpendingController.analyzeText)
spendingRoute.post("/analyze-receipt", SpendingController.analyzeReceipt)
