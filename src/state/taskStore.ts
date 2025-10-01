import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, TaskCategory, RecurrenceRule } from "../types";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
// Removed authStore import to avoid circular dependency

interface TaskState {
  tasks: Task[];
  userId: string | null;
  setUserId: (userId: string | null) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  getTasksByDate: (date: Date) => Task[];
  getTasksByCategory: (category: TaskCategory) => Task[];
  getTodaysTasks: () => Task[];
  getOverdueTasks: () => Task[];
  generateRecurringTasks: (parentTask: Task, endDate?: Date) => void;
  clearUserData: () => void;
}

const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      userId: null,

      setUserId: (userId) => set({ userId }),

      addTask: (taskData) => {
        const { userId } = get();
        if (!userId) return;

        const newTask: Task = {
          ...taskData,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        // Generate recurring tasks after the parent task is added
        if (newTask.recurring && newTask.dueDate) {
          // Use the specified end date or default to 1 year from now
          const endDate = newTask.recurring.endDate || (() => {
            const defaultEnd = new Date();
            defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
            return defaultEnd;
          })();
          get().generateRecurringTasks(newTask, endDate);
        }
      },

      updateTask: (id, updates) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id && task.userId === userId
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id || task.userId !== userId),
        }));
      },

      toggleTask: (id) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id && task.userId === userId
              ? { ...task, completed: !task.completed, updatedAt: new Date() }
              : task
          ),
        }));
      },

      getTasksByDate: (date) => {
        const { tasks, userId } = get();
        if (!userId) return [];
        
        const userTasks = tasks.filter(task => task.userId === userId);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        return userTasks.filter((task) => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === targetDate.getTime();
        });
      },

      getTasksByCategory: (category) => {
        const { tasks, userId } = get();
        if (!userId) return [];
        return tasks.filter((task) => task.category === category && task.userId === userId);
      },

      getTodaysTasks: () => {
        const today = new Date();
        return get().getTasksByDate(today);
      },

      getOverdueTasks: () => {
        const { tasks, userId } = get();
        if (!userId) return [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return tasks.filter((task) => {
          if (!task.dueDate || task.completed || task.userId !== userId) return false;
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() < today.getTime();
        });
      },

      clearUserData: () => {
        set({ tasks: [], userId: null });
      },

      generateRecurringTasks: (parentTask, endDate) => {
        if (!parentTask.recurring || !parentTask.dueDate) {
          console.log("generateRecurringTasks: Missing recurring rule or due date");
          return;
        }

        const { frequency, interval } = parentTask.recurring;
        const startDate = new Date(parentTask.dueDate);
        const tasks: Task[] = [];
        
        // Use provided endDate or default to 1 year from now
        const defaultEndDate = endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        
        console.log(`generateRecurringTasks: Generating ${frequency} tasks from ${startDate.toDateString()} to ${defaultEndDate.toDateString()}`);
        
        let currentDate = startDate;
        let count = 0;
        const maxInstances = 50; // Prevent infinite generation

        while (currentDate <= defaultEndDate && count < maxInstances) {
          // Skip the original date since it's already created
          if (count > 0) {
            const recurringTask: Task = {
              ...parentTask,
              id: `${parentTask.id}_${count}_${Date.now()}`,
              dueDate: new Date(currentDate),
              parentTaskId: parentTask.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            tasks.push(recurringTask);
            console.log(`Generated recurring task for ${currentDate.toDateString()}`);
          }

          // Calculate next occurrence
          switch (frequency) {
            case "daily":
              currentDate = addDays(currentDate, interval);
              break;
            case "weekly":
              currentDate = addWeeks(currentDate, interval);
              break;
            case "monthly":
              currentDate = addMonths(currentDate, interval);
              break;
            case "yearly":
              currentDate = addYears(currentDate, interval);
              break;
          }
          
          count++;
        }

        console.log(`generateRecurringTasks: Generated ${tasks.length} recurring tasks`);

        // Add all generated tasks to the store
        if (tasks.length > 0) {
          set((state) => ({
            tasks: [...state.tasks, ...tasks],
          }));
        }
      },
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        tasks: state.tasks.filter(task => task.userId === state.userId),
        userId: state.userId 
      }),
    }
  )
);

export default useTaskStore;