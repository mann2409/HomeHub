import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, addDays, startOfWeek } from "date-fns";
import Card from "./Card";
import MealCard from "./MealCard";
import AddMealModal from "./AddMealModal";
import EditMealModal from "./EditMealModal";
import useMealStore from "../state/mealStore";
import useSettingsStore from "../state/settingsStore";
import { MealType, Meal } from "../types";

export default function WeeklyMealPlanner() {
  const { getWeeklyMealPlan } = useMealStore();
  const { weekStartsOn } = useSettingsStore();
  const [currentWeek, setCurrentWeek] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const weeklyPlan = getWeeklyMealPlan(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(currentWeek, index));
  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner"];

  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 }));
  };

  const handleAddMeal = (date: Date, mealType: MealType) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setShowAddModal(true);
  };

  const handleMealPress = (meal: Meal | null, date: Date, mealType: MealType) => {
    if (meal) {
      setSelectedMeal(meal);
      setShowEditModal(true);
    } else {
      handleAddMeal(date, mealType);
    }
  };

  return (
    <>
      <Card className="mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            Weekly Meal Planner
          </Text>
          <Pressable
            onPress={() => setShowAddModal(true)}
            className="w-8 h-8 bg-primary rounded-full items-center justify-center"
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Week Navigation */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={goToPreviousWeek}
            className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
          >
            <Text className="text-gray-600 font-semibold">‹</Text>
          </Pressable>
          
          <Pressable onPress={goToCurrentWeek}>
            <Text className="text-base font-semibold text-gray-900">
              {format(currentWeek, "MMM d")} - {format(addDays(currentWeek, 6), "MMM d, yyyy")}
            </Text>
          </Pressable>
          
          <Pressable
            onPress={goToNextWeek}
            className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
          >
            <Text className="text-gray-600 font-semibold">›</Text>
          </Pressable>
        </View>

        {/* Meal Planning Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header Row - Days */}
            <View className="flex-row mb-2">
              <View className="w-20" />
              {weekDays.map((day, index) => (
                <View key={index} className="w-32 items-center mx-1">
                  <Text className="text-xs font-medium text-gray-600 mb-1">
                    {format(day, "EEE")}
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {format(day, "MMM d")}
                  </Text>
                </View>
              ))}
            </View>

            {/* Meal Rows */}
            {mealTypes.map((mealType) => (
              <View key={mealType} className="flex-row mb-3">
                {/* Meal Type Label */}
                <View className="w-20 justify-center pr-2">
                  <Text className="text-sm font-medium text-gray-700 capitalize">
                    {mealType}
                  </Text>
                </View>

                {/* Meal Cards for Each Day */}
                {weekDays.map((day, dayIndex) => {
                  const dateKey = day.toISOString().split("T")[0];
                  const meal = weeklyPlan[dateKey]?.[mealType];
                  
                  return (
                    <View key={dayIndex} className="w-32 mx-1">
                      <MealCard
                        meal={meal}
                        mealType={mealType}
                        onPress={() => handleMealPress(meal, day, mealType)}
                      />
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>

      <AddMealModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        initialDate={selectedDate}
        initialMealType={selectedMealType}
      />

      <EditMealModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMeal(null);
        }}
        meal={selectedMeal}
      />
    </>
  );
}