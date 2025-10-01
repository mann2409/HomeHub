import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthState {
  user: User | null;
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
  setUser: (user: User | null) => void;
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
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Update the user's display name
          try {
            await (userCredential.user as any).updateProfile({
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
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
          await sendPasswordResetEmail(auth, email);
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
          await signOut(auth);
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
onAuthStateChanged(auth, (user) => {
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
