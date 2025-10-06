import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, TaskCategory, RecurrenceRule } from "../types";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import useFamilyStore from './familyStore';

interface TaskState {
  tasks: Task[];
  userId: string | null;
  setUserId: (userId: string | null) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  getTasksByDate: (date: Date) => Task[];
  getTasksByCategory: (category: TaskCategory) => Task[];
  getTodaysTasks: () => Task[];
  getOverdueTasks: () => Task[];
  generateRecurringTasks: (parentTask: Task, endDate?: Date) => void;
  clearUserData: () => void;
  subscribeToFamilyTasks: (familyId: string) => () => void;
}

const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      userId: null,

      setUserId: (userId) => set({ userId }),

      addTask: async (taskData) => {
        const { userId } = get();
        console.log('addTask called - userId:', userId);
        
        if (!userId) {
          console.error('No userId - cannot add task');
          return;
        }

        const { activeFamilyId } = useFamilyStore.getState();
        console.log('Active family ID:', activeFamilyId);
        
        if (!activeFamilyId) {
          console.error('⚠️ No active family - task will NOT be saved to Firestore!');
          console.error('Please create or join a family in Settings first');
          // Still save locally for offline use
        }

        const taskId = Date.now().toString() + Math.random().toString(36).substring(2, 11);
        const newTask: Task = {
          ...taskData,
          id: taskId,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Save to Firestore if family exists
        if (activeFamilyId) {
          try {
            console.log('Saving task to Firestore...', { familyId: activeFamilyId, taskId });
            
            // Clean data - remove undefined values for Firestore
            const cleanTask = Object.fromEntries(
              Object.entries(newTask).filter(([_, value]) => value !== undefined)
            );
            
            await setDoc(doc(db, 'families', activeFamilyId, 'tasks', taskId), {
              ...cleanTask,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            console.log('✅ Task successfully saved to Firestore:', taskId);
          } catch (error) {
            console.error('❌ Error saving task to Firestore:', error);
          }
        }

        // Also save locally
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        // Generate recurring tasks after the parent task is added
        if (newTask.recurring && newTask.dueDate) {
          const endDate = newTask.recurring.endDate || (() => {
            const defaultEnd = new Date();
            defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
            return defaultEnd;
          })();
          get().generateRecurringTasks(newTask, endDate);
        }
      },

      updateTask: async (id, updates) => {
        const { userId } = get();
        if (!userId) return;

        const { activeFamilyId } = useFamilyStore.getState();
        if (activeFamilyId) {
          try {
            await updateDoc(doc(db, 'families', activeFamilyId, 'tasks', id), {
              ...updates,
              updatedAt: serverTimestamp(),
            });
            console.log('Task updated in Firestore:', id);
          } catch (error) {
            console.error('Error updating task in Firestore:', error);
          }
        }

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id && task.userId === userId
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },

      deleteTask: async (id) => {
        const { userId } = get();
        if (!userId) return;

        const { activeFamilyId } = useFamilyStore.getState();
        if (activeFamilyId) {
          try {
            await deleteDoc(doc(db, 'families', activeFamilyId, 'tasks', id));
            console.log('Task deleted from Firestore:', id);
          } catch (error) {
            console.error('Error deleting task from Firestore:', error);
          }
        }

        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id || task.userId !== userId),
        }));
      },

      toggleTask: async (id) => {
        const { userId } = get();
        if (!userId) return;

        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        const newCompleted = !task.completed;

        const { activeFamilyId } = useFamilyStore.getState();
        if (activeFamilyId) {
          try {
            await updateDoc(doc(db, 'families', activeFamilyId, 'tasks', id), {
              completed: newCompleted,
              updatedAt: serverTimestamp(),
            });
            console.log('Task toggled in Firestore:', id);
          } catch (error) {
            console.error('Error toggling task in Firestore:', error);
          }
        }

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id && task.userId === userId
              ? { ...task, completed: newCompleted, updatedAt: new Date() }
              : task
          ),
        }));
      },

      getTasksByDate: (date) => {
        const { tasks } = get();
        const { activeFamilyId } = useFamilyStore.getState();
        
        // Only show tasks if in a family OR if they're the user's own tasks
        if (!activeFamilyId && tasks.length > 0) {
          console.log('No active family - showing only user tasks');
          // No family, show only personal tasks
          const tasksToShow = tasks.filter(task => task.userId === get().userId);
          
          const targetDate = new Date(date);
          targetDate.setHours(0, 0, 0, 0);
          
          return tasksToShow.filter((task) => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === targetDate.getTime();
          });
        }
        
        // In a family - show all family tasks
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        console.log(`getTasksByDate: ${date.toDateString()} - Total tasks: ${tasks.length}, ActiveFamily: ${activeFamilyId}`);
        
        const filteredTasks = tasks.filter((task) => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          const matches = taskDate.getTime() === targetDate.getTime();
          if (matches) {
            console.log(`  ✓ Task matches: ${task.title} (${taskDate.toDateString()})`);
          }
          return matches;
        });
        
        console.log(`  → Returning ${filteredTasks.length} tasks for this date`);
        return filteredTasks;
      },

      getTasksByCategory: (category) => {
        const { tasks } = get();
        const { activeFamilyId } = useFamilyStore.getState();
        
        // If in a family, show all family tasks (not just user's tasks)
        const tasksToShow = activeFamilyId ? tasks : tasks.filter(task => task.userId === get().userId);
        return tasksToShow.filter((task) => task.category === category);
      },

      getTodaysTasks: () => {
        const today = new Date();
        return get().getTasksByDate(today);
      },

      getOverdueTasks: () => {
        const { tasks } = get();
        const { activeFamilyId } = useFamilyStore.getState();
        
        // If in a family, show all family tasks (not just user's tasks)
        const tasksToShow = activeFamilyId ? tasks : tasks.filter(task => task.userId === get().userId);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return tasksToShow.filter((task) => {
          if (!task.dueDate || task.completed) return false;
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() < today.getTime();
        });
      },

      clearUserData: () => {
        set({ tasks: [], userId: null });
      },

      subscribeToFamilyTasks: (familyId) => {
        console.log('Setting up real-time listener for family tasks:', familyId);
        const tasksRef = collection(db, 'families', familyId, 'tasks');
        const q = query(tasksRef);

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const firestoreTasks: Task[] = [];
            console.log('Firestore snapshot received - changes:', snapshot.size);
            
            snapshot.forEach((docSnapshot) => {
              const data = docSnapshot.data();
              
              // Convert dueDate properly
              let dueDate = undefined;
              if (data.dueDate) {
                // If it's a Firestore Timestamp
                if (data.dueDate?.toDate) {
                  dueDate = data.dueDate.toDate();
                } 
                // If it's already a Date object or timestamp
                else {
                  dueDate = new Date(data.dueDate);
                }
              }
              
              console.log('Task from Firestore:', { 
                id: docSnapshot.id, 
                title: data.title,
                dueDateRaw: data.dueDate,
                dueDateConverted: dueDate?.toISOString(),
              });
              
              firestoreTasks.push({
                ...data,
                id: docSnapshot.id,
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
                dueDate,
              } as Task);
            });
            
            console.log(`✅ Loaded ${firestoreTasks.length} tasks from Firestore`);
            console.log('Task titles:', firestoreTasks.map(t => t.title));
            set({ tasks: firestoreTasks });
          },
          (error) => {
            console.error('❌ Error subscribing to tasks:', error);
          }
        );

        return unsubscribe;
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