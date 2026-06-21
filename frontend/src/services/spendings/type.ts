import z from "zod";

export type TCategory =
  | "FOOD_DINING"
  | "TRANSPORTATION"
  | "ENTERTAINMENT"
  | "SHOPPING"
  | "OTHERS";

export type TSource = "MANUAL" | "FREE_TEXT" | "RECEIPT";

export type TSpending = {
  id: string;
  title: string;
  amount: number;
  category: TCategory;
  source: TSource;
  note: string;
  receiptUrl: string | null;
  rawText: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export const SpendingErrorMessages = {
  title: {
    required: "Title is required.",
    max: "Title must be at most 100 characters.",
  },
  amount: {
    required: "Amount is required.",
    positive: "Amount must be a positive number.",
  },
  category: {
    required: "Category is required.",
    invalid:
      "Invalid category. Choose from FOOD_DINING, TRANSPORTATION, ENTERTAINMENT, SHOPPING, or OTHERS.",
  },
  source: {
    required: "Source is required.",
    invalid: "Invalid source. Choose from MANUAL, FREE_TEXT, or RECEIPT.",
  },
  note: {
    max: "Note must be at most 500 characters.",
  },
  text: {
    required: "Text is required.",
    max: "Text must be at most 1000 characters.",
  },
  receiptUrl: {
    required: "Receipt URL is required.",
    url: "Receipt URL must be a valid URL.",
  },
} as const;

export const CategorySchema = z.enum(
  ["FOOD_DINING", "TRANSPORTATION", "ENTERTAINMENT", "SHOPPING", "OTHERS"],
  {
    message: SpendingErrorMessages.category.invalid,
  },
);

export const SourceSchema = z.enum(["MANUAL", "FREE_TEXT", "RECEIPT"], {
  message: SpendingErrorMessages.source.invalid,
});

export const schemaSpending = z.object({
  title: z
    .string({ message: SpendingErrorMessages.title.required })
    .min(1, SpendingErrorMessages.title.required)
    .max(100, SpendingErrorMessages.title.max),
  amount: z
    .number({ message: SpendingErrorMessages.amount.required })
    .positive(SpendingErrorMessages.amount.positive),
  category: CategorySchema,
  source: SourceSchema.default("MANUAL"),
  note: z.string().max(500, SpendingErrorMessages.note.max).optional(),
  date: z.string().datetime({ offset: true }).optional(),
});

export const schemaAnalyzeText = z.object({
  text: z
    .string({ message: SpendingErrorMessages.text.required })
    .min(1, SpendingErrorMessages.text.required)
    .max(1000, SpendingErrorMessages.text.max),
});

export const schemaAnalyzeReceipt = z.object({
  url: z
    .string({ message: SpendingErrorMessages.receiptUrl.required })
    .url(SpendingErrorMessages.receiptUrl.url),
});

export type TSpendingRequest = z.infer<typeof schemaSpending>;
export type TAnalyzeTextRequest = z.infer<typeof schemaAnalyzeText>;
export type TAnalyzeReceiptRequest = z.infer<typeof schemaAnalyzeReceipt>;
