import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Temporarily disabled Firebase imports
// import { 
//   signInWithEmailAndPassword, 
//   createUserWithEmailAndPassword, 
//   signOut, 
//   onAuthStateChanged,
//   sendPasswordResetEmail,
//   User
// } from 'firebase/auth';
// import { auth } from '../config/firebase';

interface AuthState {
  user: any | null;
  userName: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: any | null) => void;
  setUserName: (name: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userName: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      signUp: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock authentication - simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ 
            user: { uid: 'mock-user-id', email, displayName: name }, 
            userName: name,
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock authentication - simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ 
            user: { uid: 'mock-user-id', email, displayName: 'Mock User' }, 
            userName: 'Mock User',
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock password reset - simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock logout - simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ 
            user: null, 
            userName: null,
            isAuthenticated: false, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      setUser: (user) => set({ user, isAuthenticated: !!user, userName: user?.displayName || null }),
      setUserName: (userName) => set({ userName }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        userName: state.userName,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Initialize auth state - mock user for testing
setTimeout(() => {
  useAuthStore.getState().setLoading(false);
  useAuthStore.getState().setUser(null);
}, 1000);
