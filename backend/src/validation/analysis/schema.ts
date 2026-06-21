import { z } from "zod"

export const AnalysisErrorMessages = {
  dateFrom: {
    required: "Start date is required",
  },
  dateTo: {
    required: "End date is required",
  },
}

export const AnalysisVerdictSchema = z.object({
  dateFrom: z.string(AnalysisErrorMessages.dateFrom.required).min(1),
  dateTo: z.string(AnalysisErrorMessages.dateTo.required).min(1),
})

export const LLMAnalysisOutputSchema = z.object({
  verdict: z.string(),
  insights: z.tuple([z.string(), z.string(), z.string()]),
  recommendations: z.tuple([z.string(), z.string(), z.string()]),
})
