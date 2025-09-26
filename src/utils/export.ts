import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { Expense } from "../types";

export async function exportExpensesToJson(expenses: Expense[]): Promise<string> {
  const fileName = `expenses-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const fileUri = FileSystem.cacheDirectory + fileName;

  // Ensure dates are serialized to ISO strings
  const serializable = expenses.map((e) => ({
    ...e,
    date: new Date(e.date).toISOString(),
    createdAt: new Date(e.createdAt).toISOString(),
    updatedAt: new Date(e.updatedAt).toISOString(),
  }));

  const json = JSON.stringify({
    exportedAt: new Date().toISOString(),
    count: expenses.length,
    expenses: serializable,
    version: "1.0.0",
  }, null, 2);

  await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });

  // Share on native; return path for web
  if (Platform.OS === "ios" || Platform.OS === "android") {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, { mimeType: "application/json", dialogTitle: "Export Expenses" });
    }
  }

  return fileUri;
}


