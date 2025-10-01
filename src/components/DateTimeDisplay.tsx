import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { format } from "date-fns";
import useSettingsStore from "../state/settingsStore";

export default function DateTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { dateFormat } = useSettingsStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    try {
      return format(date, dateFormat);
    } catch (error) {
      // Fallback to default format if custom format fails
      return format(date, "MM/dd/yyyy");
    }
  };

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const formatDayOfWeek = (date: Date) => {
    return format(date, "EEEE");
  };

  return (
    <View>
      <Text className="text-lg font-semibold text-white">
        {formatDayOfWeek(currentTime)}
      </Text>
      <Text className="text-sm text-white/80">
        {formatDate(currentTime)}
      </Text>
      <Text className="text-sm text-white/80">
        {formatTime(currentTime)}
      </Text>
    </View>
  );
}