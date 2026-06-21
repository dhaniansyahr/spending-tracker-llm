import { z } from "zod"
import { CATEGORIES, SOURCES } from "@/entity/Spending.js"

export const SpendingErrorMessages = {
  title: {
    required: "Title is required",
    max: "Title must be at most 100 characters",
  },
  amount: {
    required: "Amount is required",
    positive: "Amount must be a positive number",
  },
  category: {
    required: "Category is required",
    invalid: `Invalid category, must be one of ${CATEGORIES.join(", ")}`,
  },
  note: {
    max: "Note must be at most 500 characters",
  },
  date: {
    invalid: "Invalid date format",
  },
  text: {
    required: "Text is required",
    max: "Text must be at most 1000 characters",
  },
}

export const CategorySchema = z.enum(CATEGORIES)
export const SourceSchema = z.enum(SOURCES)

export const CreateSpendingSchema = z.object({
  title: z.string(SpendingErrorMessages.title.required)
    .min(1, SpendingErrorMessages.title.required)
    .max(100, SpendingErrorMessages.title.max),
  amount: z.number({ message: SpendingErrorMessages.amount.required })
    .positive(SpendingErrorMessages.amount.positive),
  category: CategorySchema,
  source: SourceSchema.default("MANUAL"),
  note: z.string().max(500, SpendingErrorMessages.note.max).optional(),
  date: z.string().datetime({ offset: true }).optional(),
})

export const UpdateSpendingSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  amount: z.number().positive().optional(),
  category: CategorySchema.optional(),
  note: z.string().max(500).optional(),
  date: z.string().datetime({ offset: true }).optional(),
})

export const AnalyzeTextSchema = z.object({
  text: z.string({ message: SpendingErrorMessages.text.required })
    .min(1, SpendingErrorMessages.text.required)
    .max(1000, SpendingErrorMessages.text.max),
})

export const LLMSpendingOutputSchema = z.object({
  title: z.string(),
  amount: z.number().positive(),
  category: CategorySchema,
  note: z.string().optional().default(""),
})
