import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { format, addDays, startOfWeek, isSameDay, isToday } from "date-fns";
import { cn } from "../utils/cn";
import useSettingsStore from "../state/settingsStore";

interface HorizontalCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function HorizontalCalendar({ selectedDate, onDateSelect }: HorizontalCalendarProps) {
  const { weekStartsOn } = useSettingsStore();
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 }));
  const scrollViewRef = useRef<ScrollView>(null);

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    return addDays(currentWeek, index);
  });

  const goToPreviousWeek = () => {
    const newWeek = addDays(currentWeek, -7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = addDays(currentWeek, 7);
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    const today = new Date();
    const todayWeek = startOfWeek(today, { weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
    setCurrentWeek(todayWeek);
    onDateSelect(today);
  };

  return (
    <View className="mb-4">
      {/* Week Navigation */}
      <View className="flex-row items-center justify-between mb-3">
        <Pressable
          onPress={goToPreviousWeek}
          className="w-8 h-8 items-center justify-center rounded-full bg-white/20"
        >
          <Text className="text-white font-semibold">‹</Text>
        </Pressable>
        
        <Pressable onPress={goToToday}>
          <Text className="text-lg font-semibold text-white/80">
            {format(currentWeek, "MMMM yyyy")}
          </Text>
        </Pressable>
        
        <Pressable
          onPress={goToNextWeek}
          className="w-8 h-8 items-center justify-center rounded-full bg-white/20"
        >
          <Text className="text-white font-semibold">›</Text>
        </Pressable>
      </View>

      {/* Days of Week */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {weekDays.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const scale = new Animated.Value(isSelected ? 1 : 0.98);
          const handleSelect = () => {
            Animated.spring(scale, {
              toValue: 1,
              friction: 7,
              tension: 120,
              useNativeDriver: true,
            }).start(() => {
              onDateSelect(day);
            });
          };
          
          return (
            <Pressable
              key={index}
              onPress={handleSelect}
              className={cn(
                "items-center justify-center w-12 h-16 mx-1 rounded-full overflow-hidden",
                isSelected && "",
                !isSelected && isCurrentDay && "bg-white/20 border border-white/40",
                !isSelected && !isCurrentDay && "bg-white/10"
              )}
            >
              {isSelected && (
                <Animated.View 
                  style={{ 
                    transform: [{ scale }], 
                    position: "absolute", 
                    inset: 0,
                    backgroundColor: "#536DFE" // Solid color instead of gradient
                  }}
                />
              )}
              <Text
                className={cn(
                  "text-xs font-medium mb-1",
                  isSelected && "text-white",
                  !isSelected && isCurrentDay && "text-white",
                  !isSelected && !isCurrentDay && "text-white/80"
                )}
              >
                {format(day, "EEE")}
              </Text>
              <Text
                className={cn(
                  "text-lg font-semibold",
                  isSelected && "text-white",
                  !isSelected && isCurrentDay && "text-white",
                  !isSelected && !isCurrentDay && "text-white"
                )}
              >
                {format(day, "d")}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}