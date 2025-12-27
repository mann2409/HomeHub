import * as FileSystem from "expo-file-system";
import { getOpenAIClient } from "./openai";
import { ExpenseCategory } from "../types";

export interface ScannedExpense {
  amount: number;
  description: string;
  category: ExpenseCategory;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "food",
  "transport",
  "utilities",
  "entertainment",
  "health",
  "shopping",
  "home",
  "education",
  "other",
];

const EXPENSE_SCHEMA = {
  type: "object",
  required: ["amount", "description", "category"],
  additionalProperties: false,
  properties: {
    amount: {
      type: "number",
      description: "Total amount paid",
    },
    description: {
      type: "string",
      description: "Short description of the purchase",
    },
    category: {
      type: "string",
      enum: EXPENSE_CATEGORIES,
    },
  },
};

export async function scanReceiptFromImage(uri: string): Promise<ScannedExpense | null> {
  try {
    // Use the same OpenAI setup as recipe search (same client + env-based API key)
    const client = getOpenAIClient();

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const prompt = `
You are a receipt and invoice parsing assistant for a personal finance app.
Extract a single expense from the provided receipt image.

Return STRICT JSON with this exact shape, no extra fields and no explanation:
{
  "amount": 12.34,
  "description": "Short description of what was purchased",
  "category": "food" | "transport" | "utilities" | "entertainment" | "health" | "shopping" | "home" | "education" | "other"
}

Rules:
- "amount" is the TOTAL amount paid in the local currency (numeric).
- "description" should be short but meaningful (e.g. "Groceries at Woolworths", "Uber ride", "Electricity bill").
- "category" MUST be exactly one of the allowed strings, all lowercase.
`;

    const response: any = await client.chat.completions.create({
      // Match the recipe search model so behaviour and billing are consistent
      model: "gpt-4o-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "expense_extraction",
          schema: EXPENSE_SCHEMA,
          strict: true,
        },
      },
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          // Cast to any because the OpenAI client supports multimodal content but our local types do not.
          content: [
            {
              type: "text",
              text: "Here is the photo of the receipt. Parse it using the rules.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
          ] as any,
        },
      ] as any,
      temperature: 0,
      max_tokens: 300,
    });

    const raw = response.choices?.[0]?.message?.content;
    if (!raw || typeof raw !== "string") {
      console.warn("⚠️ scanReceiptFromImage: Empty or non-string response from OpenAI");
      return null;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("❌ scanReceiptFromImage: Failed to parse JSON from OpenAI", e, raw);
      return null;
    }

    const amount = typeof parsed.amount === "number" ? parsed.amount : parseFloat(parsed.amount);
    if (!amount || !isFinite(amount) || amount <= 0) {
      console.warn("⚠️ scanReceiptFromImage: Invalid amount from OpenAI", parsed.amount);
      return null;
    }

    const description =
      typeof parsed.description === "string" && parsed.description.trim().length > 0
        ? parsed.description.trim()
        : "Expense";

    const categoryValue = String(parsed.category || "").toLowerCase() as ExpenseCategory;
    const category = EXPENSE_CATEGORIES.includes(categoryValue) ? categoryValue : "other";

    return { amount, description, category };
  } catch (error) {
    console.error("❌ scanReceiptFromImage: Error calling OpenAI", error);
    return null;
  }
}


