import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WeatherData } from "../types";

interface WeatherState {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
  setWeatherData: (data: WeatherData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearWeatherData: () => void;
  shouldRefresh: () => boolean;
}

const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      weatherData: null,
      loading: false,
      error: null,
      lastFetch: null,

      setWeatherData: (data) => {
        set({
          weatherData: data,
          loading: false,
          error: null,
          lastFetch: new Date(),
        });
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error, loading: false });
      },

      clearWeatherData: () => {
        set({
          weatherData: null,
          error: null,
          lastFetch: null,
        });
      },

      shouldRefresh: () => {
        const { lastFetch } = get();
        if (!lastFetch) return true;
        
        const now = new Date();
        const timeDiff = now.getTime() - new Date(lastFetch).getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // Refresh if data is older than 1 hour
        return hoursDiff >= 1;
      },
    }),
    {
      name: "weather-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        weatherData: state.weatherData,
        lastFetch: state.lastFetch,
      }),
    }
  )
);

export default useWeatherStore;