import * as Location from "expo-location";
import { WeatherData } from "../types";

const OPENWEATHER_API_KEY = "demo_key"; // User will need to provide their own key
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export class WeatherService {
  private static instance: WeatherService;
  
  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationCoords | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error("Location permission denied");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  }

  async getWeatherByCoords(coords: LocationCoords): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        location: data.name,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
  }

  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        location: data.name,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
  }

  // Mock weather data for demo purposes when API key is not available
  getMockWeatherData(): WeatherData {
    return {
      temperature: 22,
      condition: "Clear",
      icon: "01d",
      humidity: 65,
      windSpeed: 3.2,
      location: "Demo City",
      lastUpdated: new Date(),
    };
  }

  getWeatherIcon(iconCode: string): string {
    const iconMap: Record<string, string> = {
      "01d": "sunny",
      "01n": "moon",
      "02d": "partly-sunny",
      "02n": "cloudy-night",
      "03d": "cloudy",
      "03n": "cloudy",
      "04d": "cloudy",
      "04n": "cloudy",
      "09d": "rainy",
      "09n": "rainy",
      "10d": "rainy",
      "10n": "rainy",
      "11d": "thunderstorm",
      "11n": "thunderstorm",
      "13d": "snow",
      "13n": "snow",
      "50d": "cloudy",
      "50n": "cloudy",
    };

    return iconMap[iconCode] || "partly-sunny";
  }
}