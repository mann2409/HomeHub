import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { Expense, Task, Meal, ShoppingItem, Note } from "../types";

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

export async function exportAllDataToJson(data: {
  tasks: Task[];
  meals: Meal[];
  expenses: Expense[];
  shoppingItems: ShoppingItem[];
  notes: Note[];
}): Promise<string> {
  const fileName = `homehub-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const fileUri = FileSystem.cacheDirectory + fileName;

  // Serialize all data with proper date handling
  const serializableData = {
    exportedAt: new Date().toISOString(),
    version: "1.0.0",
    appName: "HomeHub",
    data: {
      tasks: data.tasks.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt).toISOString(),
        updatedAt: new Date(task.updatedAt).toISOString(),
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      })),
      meals: data.meals.map((meal) => ({
        ...meal,
        date: new Date(meal.date).toISOString(),
        createdAt: new Date(meal.createdAt).toISOString(),
        updatedAt: new Date(meal.updatedAt).toISOString(),
      })),
      expenses: data.expenses.map((expense) => ({
        ...expense,
        date: new Date(expense.date).toISOString(),
        createdAt: new Date(expense.createdAt).toISOString(),
        updatedAt: new Date(expense.updatedAt).toISOString(),
      })),
      shoppingItems: data.shoppingItems.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt).toISOString(),
        updatedAt: new Date(item.updatedAt).toISOString(),
      })),
      notes: data.notes.map((note) => ({
        ...note,
        createdAt: new Date(note.createdAt).toISOString(),
        updatedAt: new Date(note.updatedAt).toISOString(),
      })),
    },
    summary: {
      totalTasks: data.tasks.length,
      totalMeals: data.meals.length,
      totalExpenses: data.expenses.length,
      totalShoppingItems: data.shoppingItems.length,
      totalNotes: data.notes.length,
      totalItems: data.tasks.length + data.meals.length + data.expenses.length + data.shoppingItems.length + data.notes.length,
    }
  };

  const json = JSON.stringify(serializableData, null, 2);

  await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });

  // Share on native; return path for web
  if (Platform.OS === "ios" || Platform.OS === "android") {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, { 
        mimeType: "application/json", 
        dialogTitle: "Export HomeHub Data",
        UTI: "public.json"
      });
    }
  }

  return fileUri;
}


