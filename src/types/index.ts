export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  category: TaskCategory;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  category: EventCategory;
  location?: string;
  recurring?: RecurrenceRule;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  mealType: MealType;
  date: Date;
  ingredients?: string[];
  servings?: number;
  prepTime?: number;
  category: MealCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: Date;
  paymentMethod?: PaymentMethod;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category: ShoppingCategory;
  estimatedPrice?: number;
  completed: boolean;
  priority: Priority;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  location: string;
  lastUpdated: Date;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  weatherLocation?: string;
  currency: string;
  dateFormat: string;
  weekStartsOn: number;
  notifications: NotificationSettings;
  moduleVisibility: ModuleVisibility;
  categoryColors: CategoryColors;
}

// Enums and Types
export type Priority = "low" | "medium" | "high";

export type TaskCategory = 
  | "personal" 
  | "work" 
  | "health" 
  | "home" 
  | "shopping" 
  | "finance" 
  | "other";

export type EventCategory = 
  | "personal" 
  | "work" 
  | "health" 
  | "appointment" 
  | "social" 
  | "travel" 
  | "other";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MealCategory = 
  | "healthy" 
  | "quick" 
  | "comfort" 
  | "vegetarian" 
  | "vegan" 
  | "protein" 
  | "other";

export type ExpenseCategory = 
  | "food" 
  | "transport" 
  | "utilities" 
  | "entertainment" 
  | "health" 
  | "shopping" 
  | "home" 
  | "other";

export type PaymentMethod = 
  | "cash" 
  | "card" 
  | "bank_transfer" 
  | "digital_wallet" 
  | "other";

export type ShoppingCategory = 
  | "produce" 
  | "dairy" 
  | "meat" 
  | "pantry" 
  | "frozen" 
  | "household" 
  | "personal_care" 
  | "other";

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  endDate?: Date;
  count?: number;
  daysOfWeek?: number[];
}

export interface NotificationSettings {
  tasks: boolean;
  events: boolean;
  meals: boolean;
  expenses: boolean;
  shopping: boolean;
}

export interface ModuleVisibility {
  weather: boolean;
  calendar: boolean;
  tasks: boolean;
  meals: boolean;
  finance: boolean;
  shopping: boolean;
  quickAccess: boolean;
}

export interface CategoryColors {
  taskCategories: Record<TaskCategory, string>;
  eventCategories: Record<EventCategory, string>;
  mealCategories: Record<MealCategory, string>;
  expenseCategories: Record<ExpenseCategory, string>;
  shoppingCategories: Record<ShoppingCategory, string>;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  category: NoteCategory;
  tags?: string[];
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickAccessWidget {
  id: string;
  type: "add_task" | "add_expense" | "shopping_list" | "quick_note" | "custom";
  title: string;
  icon: string;
  color: string;
  action: string;
  position: number;
  visible: boolean;
}

export type NoteCategory = 
  | "personal" 
  | "work" 
  | "ideas" 
  | "reminders" 
  | "shopping" 
  | "other";