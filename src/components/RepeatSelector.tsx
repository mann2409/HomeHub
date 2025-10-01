import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RecurrenceRule } from "../types";
import { Calendar, Clock, Repeat, ArrowClockwise, X } from "phosphor-react-native";

interface RepeatSelectorProps {
  value?: RecurrenceRule;
  onChange: (recurrence?: RecurrenceRule) => void;
}

const repeatOptions = [
  { 
    id: "none", 
    label: "No Repeat", 
    icon: <Calendar size={20} weight="regular" color="#6B7280" />,
    value: undefined 
  },
  { 
    id: "daily", 
    label: "Daily", 
    icon: <Clock size={20} weight="regular" color="#3B82F6" />,
    value: { frequency: "daily" as const, interval: 1 } 
  },
  { 
    id: "weekly", 
    label: "Weekly", 
    icon: <Repeat size={20} weight="regular" color="#10B981" />,
    value: { frequency: "weekly" as const, interval: 1 } 
  },
  { 
    id: "monthly", 
    label: "Monthly", 
    icon: <Calendar size={20} weight="regular" color="#F59E0B" />,
    value: { frequency: "monthly" as const, interval: 1 } 
  },
  { 
    id: "yearly", 
    label: "Yearly", 
    icon: <ArrowClockwise size={20} weight="regular" color="#EF4444" />,
    value: { frequency: "yearly" as const, interval: 1 } 
  },
];

export default function RepeatSelector({ value, onChange }: RepeatSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string>(
    value ? value.frequency : "none"
  );
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [endDate, setEndDate] = useState<Date>(
    value?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days from now
  );

  const handleSelect = (option: typeof repeatOptions[0]) => {
    setSelectedOption(option.id);
    if (option.value) {
      // Preserve existing end date if it exists
      const newRecurrence: RecurrenceRule = {
        ...option.value,
        endDate: value?.endDate || endDate,
      };
      onChange(newRecurrence);
    } else {
      onChange(undefined);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate && value) {
      const updatedRecurrence: RecurrenceRule = {
        ...value,
        endDate: selectedDate,
      };
      setEndDate(selectedDate);
      onChange(updatedRecurrence);
    }
  };

  const removeEndDate = () => {
    if (value) {
      const updatedRecurrence: RecurrenceRule = {
        ...value,
        endDate: undefined,
      };
      onChange(updatedRecurrence);
    }
  };

  const getSelectedOption = () => {
    return repeatOptions.find(option => option.id === selectedOption);
  };

  return (
    <View className="mb-6">
      <Text className="text-sm font-medium text-white mb-3">
        Repeat
      </Text>
      
      <View className="flex-row flex-wrap -mx-1">
        {repeatOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => handleSelect(option)}
              className={`flex-1 mx-1 mb-2 px-3 py-3 rounded-xl border ${
                isSelected
                  ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700"
                  : "bg-white border-gray-200 dark:bg-neutral-800 dark:border-neutral-700"
              }`}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View className="items-center">
                <View className="mb-2">
                  {option.icon}
                </View>
                <Text
                  className={`text-xs font-medium text-center ${
                    isSelected
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {option.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {value && (
        <View className="mt-3 space-y-3">
          <View className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <Text className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              This task will repeat {value.frequency}
              {value.endDate ? ` until ${value.endDate.toLocaleDateString()}` : " until you stop it manually"}.
            </Text>
          </View>

          {/* End Date Selection */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              End Repeat
            </Text>
            
            <View className="flex-row items-center space-x-2">
              <Pressable
                onPress={() => setShowEndDatePicker(true)}
                className="flex-1 px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg"
              >
                <Text className="text-gray-700 dark:text-gray-300">
                  {value.endDate ? value.endDate.toLocaleDateString() : "No end date"}
                </Text>
              </Pressable>
              
              {value.endDate && (
                <Pressable
                  onPress={removeEndDate}
                  className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg"
                >
                  <X size={16} weight="regular" color="#EF4444" />
                </Pressable>
              )}
            </View>
          </View>

          {showEndDatePicker && (
            <DateTimePicker
              value={value.endDate || endDate}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
      )}
    </View>
  );
}
