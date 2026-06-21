import { z } from "zod";

export interface ErrorStructure {
  field: string;
  message: string;
}

export function generateErrorStructure(field: string, message: string): ErrorStructure {
  return { field, message };
}

function extractUnknownKeys(errorMessage: string): string[] {
  const match = errorMessage.match(/Unrecognized key\(s\) in object: '([^']+)'(?:,\s*'([^']+)')*/);
  if (!match) return [];
  return match.slice(1).filter((m) => m !== undefined);
}

export function validateSchema(schema: any, data: any): ErrorStructure[] {
  const result = schema.safeParse(data);
  if (!result.success) {
    const flat = z.flattenError(result.error);
    const fieldErrors = flat.fieldErrors as Record<string, string[]>;
    const formErrors = flat.formErrors;
    const invalid: ErrorStructure[] = [];

    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (messages) invalid.push({ field, message: messages.join(", ") });
    }

    for (const msg of formErrors) {
      if (msg.startsWith("Unrecognized")) {
        extractUnknownKeys(msg).forEach((key) =>
          invalid.push({ field: key, message: `Field ${key} is not allowed` })
        );
      }
    }

    return invalid;
  }
  return [];
}
