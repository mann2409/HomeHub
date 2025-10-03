import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthState {
  user: FirebaseUser | null;
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
  setUser: (user: FirebaseUser | null) => void;
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
          
          // Update user profile with display name
          if (userCredential.user) {
            await updateProfile(userCredential.user, {
              displayName: name
            });

            set({ 
              user: userCredential.user, 
              userName: name,
              isAuthenticated: true,
              isLoading: false 
            });
          }
        } catch (error: any) {
          const errorMessage = error.code === 'auth/email-already-in-use' 
            ? 'Email already in use'
            : error.code === 'auth/weak-password'
            ? 'Password should be at least 6 characters'
            : error.message || 'Sign up failed';
            
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          throw error;
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const userCredential = await signInWithEmailAndPassword(auth, email, password);

          if (userCredential.user) {
            set({ 
              user: userCredential.user, 
              userName: userCredential.user.displayName || userCredential.user.email,
              isAuthenticated: true,
              isLoading: false 
            });
          }
        } catch (error: any) {
          const errorMessage = error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
            ? 'Invalid email or password'
            : error.message || 'Sign in failed';
            
          set({ 
            error: errorMessage, 
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
          const errorMessage = error.code === 'auth/user-not-found'
            ? 'No account found with this email'
            : error.message || 'Password reset failed';
            
          set({ 
            error: errorMessage, 
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
            error: error.message || 'Logout failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      
      setUser: (user: FirebaseUser | null) => {
        set({ 
          user,
          isAuthenticated: !!user,
          userName: user?.displayName || user?.email || null
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
onAuthStateChanged(auth, (user) => {
  const { setUser, setLoading } = useAuthStore.getState();
  
  if (user) {
    setUser(user);
  } else {
    setUser(null);
  }
  
  setLoading(false);
});

export default useAuthStore;
