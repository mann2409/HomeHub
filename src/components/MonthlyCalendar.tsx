import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay, 
  isToday, 
  isSameMonth,
  getDay
} from "date-fns";
import { cn } from "../utils/cn";
import useSettingsStore from "../state/settingsStore";
import useTaskStore from "../state/taskStore";

interface MonthlyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function MonthlyCalendar({ selectedDate, onDateSelect }: MonthlyCalendarProps) {
  const { weekStartsOn } = useSettingsStore();
  const { getTasksByDate } = useTaskStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 });

  const dateFormat = "EEE";
  const rows = [];
  let days = [];
  let day = startDate;

  // Generate calendar days
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const tasksForDay = getTasksByDate(day);
      const hasTasks = tasksForDay.length > 0;
      
      days.push({
        date: day,
        isCurrentMonth: isSameMonth(day, currentMonth),
        isToday: isToday(day),
        isSelected: isSameDay(day, selectedDate),
        hasTasks
      });
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (weekStartsOn === 1) {
    dayNames.push(dayNames.shift()!); // Move Sunday to end if week starts on Monday
  }

  return (
    <View className="mb-4">
      {/* Month Navigation */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={goToPreviousMonth}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
        >
          <Text className="text-white font-semibold text-lg">‹</Text>
        </Pressable>
        
        <Pressable onPress={goToToday}>
          <Text className="text-xl font-bold text-white">
            {format(currentMonth, "MMMM yyyy")}
          </Text>
        </Pressable>
        
        <Pressable
          onPress={goToNextMonth}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
        >
          <Text className="text-white font-semibold text-lg">›</Text>
        </Pressable>
      </View>

      {/* Day Headers */}
      <View className="flex-row mb-2">
        {dayNames.map((dayName, index) => (
          <View key={index} className="flex-1 items-center py-2">
            <Text className="text-sm font-medium text-white/70">
              {dayName}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      {rows.map((week, weekIndex) => (
        <View key={weekIndex} className="flex-row mb-1">
          {week.map((dayData, dayIndex) => {
            const { date, isCurrentMonth, isToday, isSelected, hasTasks } = dayData;
            
            return (
              <Pressable
                key={dayIndex}
                onPress={() => onDateSelect(date)}
                className={cn(
                  "flex-1 items-center justify-center h-12 mx-0.5 rounded-lg",
                  isSelected && "bg-blue-500",
                  !isSelected && isToday && "bg-white/20 border border-white/40",
                  !isSelected && !isToday && isCurrentMonth && "bg-white/10",
                  !isSelected && !isToday && !isCurrentMonth && "bg-transparent"
                )}
              >
                <View className="items-center">
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      isSelected && "text-white",
                      !isSelected && isToday && "text-white",
                      !isSelected && isCurrentMonth && "text-white/90",
                      !isSelected && !isCurrentMonth && "text-white/40"
                    )}
                  >
                    {format(date, "d")}
                  </Text>
                  {hasTasks && (
                    <View className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
