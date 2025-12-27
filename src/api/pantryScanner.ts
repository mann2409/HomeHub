import * as FileSystem from "expo-file-system";
import { getOpenAIClient } from "./openai";
import { PantryItem } from "../types/pantry";

export interface ScannedPantryItemInput {
  name: string;
  quantity?: string;
  expiryDays: number;
}

type ScannedPantryResponse = { items: ScannedPantryItemInput[] };

// OpenAI's json_schema response_format requires a top-level object schema.
// We wrap the array under an "items" field to comply.
const PANTRY_SCHEMA = {
  type: "object",
  required: ["items"],
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "quantity", "expiryDays"],
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          quantity: { type: "string" },
          expiryDays: { type: "integer", minimum: 1 },
        },
      },
    },
  },
};

export async function scanPantryFromImage(uri: string): Promise<ScannedPantryItemInput[] | null> {
  try {
    const client = getOpenAIClient();

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const prompt = `
You are a grocery receipt parsing assistant for a pantry tracking app.
Given a photo of a supermarket receipt, identify all shelf-stable and fridge items that belong in a pantry.

Return STRICT JSON with this exact shape (no comments, no extra keys):
[
  {
    "name": "Item name",
    "quantity": "optional quantity/size like '2 x 500g' or '1 pack'",
    "expiryDays": 30
  }
]

Rules:
- Only include food or household items that can be tracked in a pantry.
- "name" should be human-readable (e.g. "olive oil", "pasta", "milk").
- "expiryDays" is an estimate of how many days from TODAY the item is safe to use.
- Use conservative but reasonable estimates (e.g. fresh bread 3 days, milk 5 days, dry pasta 365 days).
`;

    const response: any = await client.chat.completions.create({
      model: "gpt-4o",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pantry_items",
          schema: PANTRY_SCHEMA,
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
          content: [
            {
              type: "text",
              text: "Here is a receipt photo. Extract pantry items following the rules.",
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
      max_tokens: 800,
    });

    const raw = response.choices?.[0]?.message?.content;
    if (!raw || typeof raw !== "string") {
      console.warn("⚠️ scanPantryFromImage: Empty or non-string response from OpenAI");
      return null;
    }

    let parsed: ScannedPantryResponse | null = null;
    try {
      parsed = JSON.parse(raw) as ScannedPantryResponse;
    } catch (e) {
      console.error("❌ scanPantryFromImage: Failed to parse JSON from OpenAI", e, raw);
      return null;
    }

    if (!parsed || !Array.isArray(parsed.items)) {
      console.warn("⚠️ scanPantryFromImage: Parsed response missing items array");
      return null;
    }

    const items: ScannedPantryItemInput[] = parsed.items
      .map((item: any) => {
        if (!item || typeof item.name !== "string") return null;
        const days = typeof item.expiryDays === "number" ? item.expiryDays : parseInt(item.expiryDays, 10);
        const expiryDays = Number.isFinite(days) && days > 0 ? days : 7;
        return {
          name: item.name.trim(),
          quantity: typeof item.quantity === "string" ? item.quantity.trim() : undefined,
          expiryDays,
        };
      })
      .filter(Boolean);

    return items.length ? items : null;
  } catch (error) {
    console.error("❌ scanPantryFromImage: Error calling OpenAI", error);
    return null;
  }
}

export function toPantryItems(scanned: ScannedPantryItemInput[]): PantryItem[] {
  const today = new Date();
  return scanned.map((item) => {
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + item.expiryDays);
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: item.name,
      quantity: item.quantity,
      expiryDate,
      createdAt: today,
    };
  });
}


