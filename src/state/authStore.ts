import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';

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
          const userCredential = await auth().createUserWithEmailAndPassword(email, password);
          
          // Update the user's display name
          try {
            await userCredential.user.updateProfile({
              displayName: name
            });
          } catch (updateError) {
            console.log('Could not update profile:', updateError);
          }
          
          set({ 
            user: userCredential.user, 
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
          const userCredential = await auth().signInWithEmailAndPassword(email, password);
          set({ 
            user: userCredential.user, 
            userName: userCredential.user.displayName,
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
          await auth().sendPasswordResetEmail(email);
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
          await auth().signOut();
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

// Initialize auth state listener
auth().onAuthStateChanged((user) => {
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setLoading(false);
  
  // Sync user data across all stores
  if (user) {
    const { syncUserData } = require('../utils/userSync');
    syncUserData(user.uid);
  } else {
    const { clearAllUserData } = require('../utils/userSync');
    clearAllUserData();
  }
});
