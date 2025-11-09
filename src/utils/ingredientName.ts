export function cleanIngredientName(rawName: string): string {
  if (!rawName) return "";

  let name = rawName.replace(/\s+/g, " ").trim();
  if (!name) return "";

  const tokens = name.split(" ");
  const measurementWords = new Set([
    "cup",
    "cups",
    "tbsp",
    "tablespoon",
    "tablespoons",
    "tsp",
    "teaspoon",
    "teaspoons",
    "lb",
    "lbs",
    "pound",
    "pounds",
    "oz",
    "ounce",
    "ounces",
    "g",
    "gram",
    "grams",
    "kg",
    "kilogram",
    "kilograms",
    "ml",
    "milliliter",
    "milliliters",
    "l",
    "liter",
    "liters",
    "clove",
    "cloves",
    "slice",
    "slices",
    "can",
    "cans",
    "packet",
    "packets",
    "pkg",
    "pinch",
    "dash",
    "stick",
    "sticks",
    "piece",
    "pieces",
    "bunch",
    "bunches",
    "x",
  ]);

  const prepWords = new Set([
    "diced",
    "chopped",
    "minced",
    "sliced",
    "crushed",
    "ground",
    "grated",
    "shredded",
    "peeled",
    "rinsed",
    "drained",
    "halved",
    "juiced",
    "zested",
    "trimmed",
    "beaten",
    "softened",
    "melted",
    "cooked",
    "uncooked",
    "freshly",
    "finely",
    "roughly",
    "lightly",
    "thinly",
    "thickly",
    "warm",
    "cold",
  ]);

  const unicodeFractionRegex = /[\u00BC-\u00BE\u2150-\u215E]/;

  const isNumericToken = (token: string) => {
    const sanitized = token.replace(/[^0-9./-]/g, "");
    if (!sanitized) return false;
    if (/^\d+([./-]\d+)?$/.test(sanitized)) return true;
    if (/^\d+\s*\/\s*\d+$/.test(sanitized)) return true;
    return unicodeFractionRegex.test(token);
  };

  let startIndex = 0;

  while (startIndex < tokens.length) {
    const rawToken = tokens[startIndex];
    const stripped = rawToken.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");

    if (!stripped) {
      startIndex++;
      continue;
    }

    const lower = stripped.toLowerCase();

    if (isNumericToken(stripped)) {
      startIndex++;
      continue;
    }

    if (measurementWords.has(lower) || prepWords.has(lower) || lower === "of") {
      startIndex++;
      continue;
    }

    break;
  }

  const remainingTokens = tokens
    .slice(startIndex)
    .map((token) => token.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ""))
    .filter(Boolean);

  return remainingTokens.join(" ").trim();
}

