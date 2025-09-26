import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, TaskCategory } from "../types";

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  getTasksByDate: (date: Date) => Task[];
  getTasksByCategory: (category: TaskCategory) => Task[];
  getTodaysTasks: () => Task[];
  getOverdueTasks: () => Task[];
}

const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: !task.completed, updatedAt: new Date() }
              : task
          ),
        }));
      },

      getTasksByDate: (date) => {
        const tasks = get().tasks;
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        return tasks.filter((task) => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === targetDate.getTime();
        });
      },

      getTasksByCategory: (category) => {
        return get().tasks.filter((task) => task.category === category);
      },

      getTodaysTasks: () => {
        const today = new Date();
        return get().getTasksByDate(today);
      },

      getOverdueTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return get().tasks.filter((task) => {
          if (!task.dueDate || task.completed) return false;
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() < today.getTime();
        });
      },
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useTaskStore;