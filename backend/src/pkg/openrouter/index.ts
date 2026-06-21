import { LLMSpendingOutputSchema } from "@/validation/spending/schema.js";
import { LLMAnalysisOutputSchema } from "@/validation/analysis/schema.js";
import type {
  LLMSpendingOutput,
  LLMAnalysisOutput,
  SpendingSummaryDTO,
} from "@/entity/Llm.js";

const BASE_URL =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const MODEL = process.env.OPENROUTER_MODEL ?? "minimax/minimax-m3";

type TextMessage = { role: "user" | "assistant" | "system"; content: string };
type VisionMessage = {
  role: "user";
  content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  >;
};

const CATEGORIES_DESC = `- FOOD_DINING: restaurants, food delivery, groceries, drinks, snacks
- TRANSPORTATION: fuel, ride-hailing (Gojek/Grab), parking, toll, public transit
- ENTERTAINMENT: movies, games, streaming, hobbies, events
- SHOPPING: clothing, electronics, household items, online shopping
- OTHERS: healthcare, bills, education, gifts, anything else`;

async function chatCompletion(messages: TextMessage[]): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost",
      "X-Title": "Spending Tracker",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
      max_tokens: 512,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return json.choices[0].message.content;
}

async function visionCompletion(
  imageUrl: string,
  prompt: string,
): Promise<string> {
  const messages: VisionMessage[] = [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageUrl } },
      ],
    },
  ];
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost",
      "X-Title": "Spending Tracker",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
      max_tokens: 512,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return json.choices[0].message.content;
}

export async function analyzeText(text: string): Promise<LLMSpendingOutput> {
  const prompt = `You are a spending categorization assistant. Extract spending data from the user's message.

Categories (use EXACTLY these enum values):
${CATEGORIES_DESC}

User text: "${text}"

Respond ONLY with valid JSON (no markdown, no explanation):
{"title":"<short descriptive title, max 50 chars>","amount":<number without currency>,"category":"<ENUM_VALUE>","note":"<optional context or empty string>"}`;

  const raw = await chatCompletion([{ role: "user", content: prompt }]);
  return LLMSpendingOutputSchema.parse(JSON.parse(raw)) as LLMSpendingOutput;
}

export async function analyzeReceipt(
  imageUrl: string,
): Promise<LLMSpendingOutput> {
  const prompt = `You are a receipt OCR and spending categorization assistant.
Analyze this receipt image and extract the spending data.

Categories (use EXACTLY these enum values):
FOOD_DINING, TRANSPORTATION, ENTERTAINMENT, SHOPPING, OTHERS

Respond ONLY with valid JSON (no markdown, no explanation):
{"title":"<merchant name, max 50 chars>","amount":<total as number without currency>,"category":"<ENUM_VALUE>","note":"<brief summary or empty string>"}`;

  const raw = await visionCompletion(imageUrl, prompt);
  return LLMSpendingOutputSchema.parse(JSON.parse(raw)) as LLMSpendingOutput;
}

export async function generateVerdict(
  input: SpendingSummaryDTO,
): Promise<LLMAnalysisOutput> {
  const categoryBreakdown = Object.entries(input.byCategory)
    .map(([cat, amt]) => `  ${cat}: ${amt}`)
    .join("\n");
  const topList = input.topSpendings
    .slice(0, 5)
    .map((s, i) => `  ${i + 1}. ${s.title} (${s.category}): ${s.amount}`)
    .join("\n");

  const prompt = `You are a personal finance analyst for the period ${input.dateFrom} to ${input.dateTo}.

Total spending: ${input.totalAmount}
By category:
${categoryBreakdown}

Top 5 spendings:
${topList}

Write a concise financial assessment (2-3 sentences), 3 key insights, and 3 actionable recommendations.

Respond ONLY with valid JSON (no markdown):
{"verdict":"<2-3 sentences>","insights":["<1>","<2>","<3>"],"recommendations":["<1>","<2>","<3>"]}`;

  const raw = await chatCompletion([{ role: "user", content: prompt }]);
  return LLMAnalysisOutputSchema.parse(JSON.parse(raw)) as LLMAnalysisOutput;
}
