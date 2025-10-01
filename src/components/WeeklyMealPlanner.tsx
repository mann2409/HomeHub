import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import Card from "./Card";
import MealCard from "./MealCard";
import AddMealModal from "./AddMealModal";
import EditMealModal from "./EditMealModal";
import Toast from "./Toast";
import useMealStore from "../state/mealStore";
import useShoppingStore from "../state/shoppingStore";
import useSettingsStore from "../state/settingsStore";
import { MealType, Meal } from "../types";

export default function WeeklyMealPlanner() {
  const { getWeeklyMealPlan } = useMealStore();
  const { addItem: addShoppingItem, autoCategorizeName } = useShoppingStore();
  const { weekStartsOn } = useSettingsStore();
  const [currentWeek, setCurrentWeek] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const confettiAnimation = useState(new Animated.Value(0))[0];

  // Helper functions
  const isToday = (date: Date) => isSameDay(date, new Date());
  
  const getMealTypeColor = (mealType: MealType) => {
    switch (mealType) {
      case "breakfast":
        return ["#FCE38A", "#F38181"]; // Gold to coral
      case "lunch":
        return ["#36D1C4", "#96E6A1"]; // Teal to green
      case "dinner":
        return ["#9B5DE5", "#661AE6"]; // Purple gradient
      case "snack":
        return ["#FFB347", "#FFCC5C"]; // Orange gradient
      default:
        return ["#3B82F6", "#8B5CF6"]; // Blue to purple
    }
  };

  const getMealTypeIcon = (mealType: MealType) => {
    switch (mealType) {
      case "breakfast":
        return "sunny";
      case "lunch":
        return "restaurant";
      case "dinner":
        return "moon";
      case "snack":
        return "cafe";
      default:
        return "restaurant";
    }
  };

  const weeklyPlan = getWeeklyMealPlan(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(currentWeek, index));
  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner"];

  // Calculate summary statistics
  const getWeeklySummary = () => {
    let totalPlanned = 0;
    let totalSlots = 21; // 7 days * 3 meal types
    const mealTypeCounts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    
    weekDays.forEach(day => {
      const dateKey = day.toISOString().split("T")[0];
      const dayPlan = weeklyPlan[dateKey];
      if (dayPlan) {
        mealTypes.forEach(mealType => {
          const meal = dayPlan[mealType];
          if (meal) {
            totalPlanned++;
            mealTypeCounts[mealType]++;
          }
        });
      }
    });
    
    return {
      totalPlanned,
      totalSlots,
      percentage: totalSlots > 0 ? Math.round((totalPlanned / totalSlots) * 100) : 0,
      mealTypeCounts
    };
  };

  const summary = getWeeklySummary();

  // Confetti animation when week is fully planned
  useEffect(() => {
    if (summary.percentage === 100 && !showConfetti) {
      setShowConfetti(true);
      Animated.sequence([
        Animated.timing(confettiAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnimation, {
          toValue: 0,
          duration: 800,
          delay: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => setShowConfetti(false));
    }
  }, [summary.percentage]);

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

  const handleGenerateShoppingList = () => {
    // Get all meals from the current week
    const allIngredients: string[] = [];
    
    weekDays.forEach(day => {
      const dateKey = day.toISOString().split("T")[0];
      const dayPlan = weeklyPlan[dateKey];
      
      if (dayPlan) {
        mealTypes.forEach(mealType => {
          const meal = dayPlan[mealType];
          if (meal && meal.ingredients && meal.ingredients.length > 0) {
            allIngredients.push(...meal.ingredients);
          }
        });
      }
    });

    if (allIngredients.length === 0) {
      setToastMessage("No ingredients found in your meal plan");
      setToastType("info");
      setShowToast(true);
      return;
    }

    // Add ingredients to shopping list
    let addedCount = 0;
    allIngredients.forEach(ingredient => {
      const trimmedIngredient = ingredient.trim();
      if (trimmedIngredient) {
        const category = autoCategorizeName(trimmedIngredient);
        addShoppingItem({
          name: trimmedIngredient,
          quantity: 1,
          category,
          completed: false,
          priority: "medium",
        });
        addedCount++;
      }
    });

    setToastMessage(`Added ${addedCount} ingredient${addedCount !== 1 ? 's' : ''} to shopping list!`);
    setToastType("success");
    setShowToast(true);
  };

  return (
    <>
      {/* Confetti Animation Overlay */}
      {showConfetti && (
        <Animated.View
          className="absolute inset-0 z-50 pointer-events-none items-center justify-center"
          style={{
            opacity: confettiAnimation,
            transform: [
              {
                scale: confettiAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ],
          }}
        >
          <View className="items-center">
            <Ionicons name="trophy" size={80} color="#FFD700" />
            <Text className="text-white text-2xl font-bold mt-4">
              Week Complete! 🎉
            </Text>
            <Text className="text-white/80 text-base mt-2">
              All meals planned!
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Summary Chip - Floating */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={() => setShowSummary(!showSummary)}
          className="flex-row items-center bg-white/25 rounded-full px-4 py-3 flex-1 mr-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View className="bg-white/30 rounded-full p-2 mr-3">
            <Ionicons name="stats-chart" size={18} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xs font-medium opacity-90">
              Planning Progress
            </Text>
            <Text className="text-white text-base font-bold">
              {summary.totalPlanned}/{summary.totalSlots} meals ({summary.percentage}%)
            </Text>
          </View>
          <Ionicons 
            name={showSummary ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#FFFFFF" 
          />
        </Pressable>

        {/* Quick Add Button */}
        <Pressable
          onPress={() => {
            setSelectedDate(new Date());
            setSelectedMealType("breakfast");
            setShowAddModal(true);
          }}
          className="bg-primary rounded-full p-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Expanded Summary Card */}
      {showSummary && (
        <Card className="mb-4">
          <Text className="text-lg font-bold text-white mb-4">Weekly Summary</Text>
          
          {/* Progress Bar */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white/80 text-sm">Overall Progress</Text>
              <Text className="text-white font-bold text-sm">{summary.percentage}%</Text>
            </View>
            <View className="h-3 bg-white/20 rounded-full overflow-hidden">
              <View 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                style={{ width: `${summary.percentage}%` }}
              >
                <LinearGradient
                  colors={["#9B5DE5", "#36D1C4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-full"
                />
              </View>
            </View>
          </View>

          {/* Meal Type Breakdown */}
          <View className="flex-row justify-around mb-4">
            {mealTypes.map((type) => (
              <View key={type} className="items-center">
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: getMealTypeColor(type)[0] + '40' }}
                >
                  <Ionicons 
                    name={getMealTypeIcon(type) as any} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </View>
                <Text className="text-white/80 text-xs capitalize mb-1">{type}</Text>
                <Text className="text-white text-lg font-bold">
                  {summary.mealTypeCounts[type]}/7
                </Text>
              </View>
            ))}
          </View>

          {/* Motivational Message */}
          {summary.percentage === 100 && (
            <View className="bg-white/10 rounded-lg p-3 items-center">
              <Text className="text-white text-sm text-center">
                🌟 Amazing! Your week is fully planned! 🌟
              </Text>
            </View>
          )}
          {summary.percentage >= 50 && summary.percentage < 100 && (
            <View className="bg-white/10 rounded-lg p-3 items-center">
              <Text className="text-white text-sm text-center">
                💪 Great progress! Keep going!
              </Text>
            </View>
          )}
          {summary.percentage < 50 && summary.percentage > 0 && (
            <View className="bg-white/10 rounded-lg p-3 items-center">
              <Text className="text-white text-sm text-center">
                🚀 You're off to a good start!
              </Text>
            </View>
          )}
        </Card>
      )}

      <Card>
        {/* Week Navigation */}
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={goToPreviousWeek}
            className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
          
          <Pressable onPress={goToCurrentWeek} className="flex-1 items-center">
            <Text className="text-white/80 text-xs font-medium mb-1">WEEK OF</Text>
            <Text className="text-lg font-bold text-white">
              {format(currentWeek, "MMM d")} – {format(addDays(currentWeek, 6), "MMM d, yyyy")}
            </Text>
          </Pressable>
          
          <Pressable
            onPress={goToNextWeek}
            className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Empty State */}
        {summary.totalPlanned === 0 && (
          <View className="items-center justify-center py-12 px-4">
            <View className="w-32 h-32 rounded-full bg-white/10 items-center justify-center mb-6">
              <Ionicons name="calendar-outline" size={64} color="#FFFFFF" opacity={0.5} />
            </View>
            <Text className="text-white text-2xl font-bold mb-2 text-center">
              Start Planning Your Week!
            </Text>
            <Text className="text-white/80 text-base text-center mb-6 max-w-xs">
              Tap 'Add' on any meal slot below or drag meals to easily set up your week
            </Text>
            <Pressable
              onPress={() => {
                setSelectedDate(weekDays[0]);
                setSelectedMealType("breakfast");
                setShowAddModal(true);
              }}
              className="bg-primary rounded-full px-6 py-3"
            >
              <Text className="text-white font-bold">Get Started</Text>
            </Pressable>
          </View>
        )}

        {/* Meal Planning Grid */}
        {summary.totalPlanned > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Header Row - Days */}
              <View className="flex-row mb-3">
                <View className="w-24" />
                {weekDays.map((day, index) => (
                  <View 
                    key={index} 
                    className={`w-36 items-center mx-1 rounded-xl p-3 ${
                      isToday(day) ? 'bg-primary/30 border-2 border-primary' : 'bg-white/10'
                    }`}
                    style={{
                      shadowColor: isToday(day) ? "#9B5DE5" : "transparent",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: isToday(day) ? 3 : 0,
                    }}
                  >
                    <Text className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                      isToday(day) ? 'text-primary' : 'text-white/70'
                    }`}>
                      {format(day, "EEE")}
                    </Text>
                    <Text className={`text-base font-bold ${
                      isToday(day) ? 'text-white' : 'text-white/90'
                    }`}>
                      {format(day, "MMM d")}
                    </Text>
                    {isToday(day) && (
                      <View className="mt-1.5 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </View>
                ))}
              </View>

              {/* Meal Rows */}
              {mealTypes.map((mealType) => (
                <View key={mealType} className="flex-row mb-4">
                  {/* Meal Type Label */}
                  <View className="w-24 justify-center pr-2">
                    <View className="items-start">
                      <View 
                        className="rounded-xl px-3 py-2 items-center"
                        style={{ backgroundColor: getMealTypeColor(mealType)[0] + '30' }}
                      >
                        <Ionicons 
                          name={getMealTypeIcon(mealType) as any} 
                          size={18} 
                          color="#FFFFFF" 
                        />
                        <Text className="text-xs font-bold text-white/90 capitalize mt-1">
                          {mealType}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Meal Cards for Each Day */}
                  {weekDays.map((day, dayIndex) => {
                    const dateKey = day.toISOString().split("T")[0];
                    const meal = weeklyPlan[dateKey]?.[mealType];
                    
                    return (
                      <View key={dayIndex} className="w-36 mx-1">
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
        )}
      </Card>

      {/* Generate Groceries FAB */}
      {summary.totalPlanned > 0 && (
        <View className="mt-4">
          <Pressable
            onPress={handleGenerateShoppingList}
            className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-4 flex-row items-center justify-center"
            style={{
              shadowColor: "#9B5DE5",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={["#9B5DE5", "#36D1C4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute inset-0 rounded-2xl"
            />
            <Ionicons name="cart" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text className="text-white text-lg font-bold">Generate Shopping List</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </Pressable>
        </View>
      )}

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

      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </>
  );
}