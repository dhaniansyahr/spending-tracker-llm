import { Hono } from "hono"
import * as AnalysisController from "@/controllers/Analysis.js"
import * as AnalysisValidation from "@/validation/analysis/validation.js"

export const analysisRoute = new Hono()

analysisRoute.post("/verdict", AnalysisValidation.validateAnalysisVerdict, AnalysisController.getVerdict)
