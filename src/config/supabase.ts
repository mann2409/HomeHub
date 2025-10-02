import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'your-anon-key';

// For development, you can use these placeholder values
// Replace with your actual Supabase project credentials
const isDevelopment = true;

const supabaseUrlFinal = isDevelopment ? 'https://placeholder.supabase.co' : supabaseUrl;
const supabaseAnonKeyFinal = isDevelopment ? 'placeholder-anon-key' : supabaseAnonKey;

// Create Supabase client
export const supabase = createClient(supabaseUrlFinal, supabaseAnonKeyFinal, {
  auth: {
    storage: {
      getItem: async (key: string) => {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return AsyncStorage.getItem(key);
      },
      setItem: async (key: string, value: string) => {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return AsyncStorage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return AsyncStorage.removeItem(key);
      },
    },
  },
});

export default supabase;
