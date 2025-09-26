import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import useWeatherStore from "../state/weatherStore";
import useSettingsStore from "../state/settingsStore";
import { WeatherService } from "../services/weatherService";

export default function WeatherWidget() {
  const { weatherData, loading, error, shouldRefresh, setWeatherData, setLoading, setError } = useWeatherStore();
  const { weatherLocation } = useSettingsStore();
  const weatherService = WeatherService.getInstance();

  const fetchWeather = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      let weather;
      
      if (weatherLocation) {
        weather = await weatherService.getWeatherByCity(weatherLocation);
      } else {
        const coords = await weatherService.getCurrentLocation();
        if (coords) {
          weather = await weatherService.getWeatherByCoords(coords);
        } else {
          // Use mock data if location is not available
          weather = weatherService.getMockWeatherData();
        }
      }
      
      setWeatherData(weather);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Unable to fetch weather");
      // Use mock data as fallback
      setWeatherData(weatherService.getMockWeatherData());
    }
  };

  useEffect(() => {
    if (!weatherData || shouldRefresh()) {
      fetchWeather();
    }
  }, [weatherLocation]);

  const handleRefresh = () => {
    fetchWeather();
  };

  if (error && !weatherData) {
    return (
      <Pressable onPress={handleRefresh} className="items-end">
        <View className="flex-row items-center">
          <Ionicons name="refresh" size={16} color="#EF4444" />
          <Text className="text-sm text-red-500 ml-1">Weather</Text>
        </View>
      </Pressable>
    );
  }

  if (loading && !weatherData) {
    return (
      <View className="items-end">
        <View className="flex-row items-center">
          <Ionicons name="partly-sunny" size={16} color="#6B7280" />
          <Text className="text-sm text-gray-500 ml-1">Loading...</Text>
        </View>
      </View>
    );
  }

  if (!weatherData) {
    return null;
  }

  const iconName = weatherService.getWeatherIcon(weatherData.icon) as keyof typeof Ionicons.glyphMap;

  return (
    <Pressable onPress={handleRefresh} className="items-end">
      <View className="px-3 py-2 rounded-2xl overflow-hidden">
        <BlurView intensity={20} tint="systemChromeMaterial" style={{ position: "absolute", inset: 0 }} />
        <LinearGradient
          colors={["#536DFE", "#00E0FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.75 }}
        />
        <View className="flex-row items-center">
          <Ionicons name={iconName} size={14} color="#FFFFFF" />
          <Text className="text-xs font-semibold text-white ml-1">
            {weatherData.temperature}°
          </Text>
        </View>
        <Text className="text-[10px] text-white/90 mt-0.5">
          {weatherData.condition}
        </Text>
      </View>
    </Pressable>
  );
}