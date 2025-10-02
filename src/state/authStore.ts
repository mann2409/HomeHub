import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

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
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Store the user name locally instead of updating Firebase profile
          // This avoids the updateProfile issue and still provides the functionality
          
          set({ 
            user: userCredential.user, 
            userName: name,
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          const authError = error as AuthError;
          set({ 
            error: authError.message, 
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
            userName: userCredential.user.displayName || userCredential.user.email,
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error: any) {
          const authError = error as AuthError;
          set({ 
            error: authError.message, 
            isLoading: false 
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          
          if (error) throw error;
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Password reset failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await supabase.auth.signOut();
          
          if (error) throw error;
          
          set({ 
            user: null, 
            userName: null,
            isAuthenticated: false,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Logout failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      
      setUser: (user: any | null) => {
        set({ 
          user,
          isAuthenticated: !!user,
          userName: user?.user_metadata?.full_name || user?.email || null
        });
      },
      
      setUserName: (name: string | null) => set({ userName: name }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
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
supabase.auth.onAuthStateChange((event, session) => {
  const { setUser, setLoading } = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    setUser(session.user);
  } else if (event === 'SIGNED_OUT') {
    setUser(null);
  }
  
  setLoading(false);
});