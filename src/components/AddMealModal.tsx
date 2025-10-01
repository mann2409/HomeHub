import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { format, addDays } from "date-fns";
import Modal from "./Modal";
import Input from "./Input";
import Card from "./Card";
import { MealType, MealCategory, Meal, DietaryBadge } from "../types";
import useMealStore from "../state/mealStore";

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialMealType?: MealType;
}

export default function AddMealModal({ 
  visible, 
  onClose, 
  initialDate = new Date(),
  initialMealType = "breakfast"
}: AddMealModalProps) {
  const { addMeal, getMealsByDate, getMealsByDateRange } = useMealStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [category, setCategory] = useState<MealCategory>("other");
  const [prepTime, setPrepTime] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedBadges, setSelectedBadges] = useState<DietaryBadge[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([]);
  const [yesterdayMeals, setYesterdayMeals] = useState<Meal[]>([]);
  const [lastWeekMeals, setLastWeekMeals] = useState<Meal[]>([]);

  const dietaryBadges: DietaryBadge[] = [
    "vegetarian",
    "vegan",
    "gluten-free",
    "dairy-free",
    "nut-free",
    "keto",
    "paleo",
    "kids-friendly",
  ];

  const resetForm = () => {
    setName("");
    setDescription("");
    setDate(initialDate);
    setShowDatePicker(false);
    setMealType(initialMealType);
    setCategory("other");
    setPrepTime("");
    setServings("");
    setIngredients("");
    setNotes("");
    setSelectedBadges([]);
    setShowQuickAdd(false);
  };

  // Update date when initialDate changes
  useEffect(() => {
    setDate(initialDate);
  }, [initialDate]);

  // Load smart suggestions when modal opens or date changes
  useEffect(() => {
    if (visible) {
      // Get yesterday's meals
      const yesterday = addDays(date, -1);
      const yesterdayMealsData = getMealsByDate(yesterday);
      setYesterdayMeals(yesterdayMealsData);

      // Get last week's meals for the same meal type
      const lastWeek = addDays(date, -7);
      const lastWeekMealsData = getMealsByDate(lastWeek);
      setLastWeekMeals(lastWeekMealsData);

      // Get favorite meals (meals that appear frequently)
      const recentMeals = getMealsByDateRange(
        addDays(date, -30), 
        addDays(date, -1)
      );
      
      // Count meal frequency
      const mealFrequency = recentMeals.reduce((acc, meal) => {
        const key = `${meal.name}-${meal.mealType}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get top 5 most frequent meals
      const favorites = Object.entries(mealFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([key]) => {
          const [name, mealType] = key.split('-');
          return recentMeals.find(m => m.name === name && m.mealType === mealType);
        })
        .filter(Boolean) as Meal[];
      
      setFavoriteMeals(favorites);
    }
  }, [visible, date, getMealsByDate, getMealsByDateRange]);

  const handleSave = () => {
    if (!name.trim()) return;

    const ingredientsList = ingredients
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);

    addMeal({
      name: name.trim(),
      description: description.trim() || undefined,
      mealType,
      date: date,
      ingredients: ingredientsList.length > 0 ? ingredientsList : undefined,
      servings: servings ? parseInt(servings) : undefined,
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      category,
      notes: notes.trim() || undefined,
      dietaryBadges: selectedBadges.length > 0 ? selectedBadges : undefined,
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleQuickAdd = (meal: Meal) => {
    setName(meal.name);
    setDescription(meal.description || "");
    setMealType(meal.mealType);
    setCategory(meal.category);
    setPrepTime(meal.prepTime?.toString() || "");
    setServings(meal.servings?.toString() || "");
    setIngredients(meal.ingredients?.join(", ") || "");
    setNotes(meal.notes || "");
    setSelectedBadges(meal.dietaryBadges || []);
    setShowQuickAdd(false);
  };

  const toggleBadge = (badge: DietaryBadge) => {
    if (selectedBadges.includes(badge)) {
      setSelectedBadges(selectedBadges.filter(b => b !== badge));
    } else {
      setSelectedBadges([...selectedBadges, badge]);
    }
  };

  const getMealTypeIcon = (type: MealType) => {
    const icons = {
      breakfast: "sunny",
      lunch: "restaurant",
      dinner: "moon",
      snack: "cafe",
    };
    return icons[type];
  };

  const isFormValid = name.trim();

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="New Meal"
      navigationMode={true}
      leftButton={{
        title: "Cancel",
        onPress: handleClose,
      }}
      rightButton={{
        title: "Save",
        onPress: handleSave,
        disabled: !isFormValid,
      }}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {/* Smart Suggestions */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-white">Quick Add</Text>
            <Pressable
              onPress={() => setShowQuickAdd(!showQuickAdd)}
              className="flex-row items-center"
            >
              <Text className="text-white/80 text-sm mr-1">
                {showQuickAdd ? 'Hide' : 'Show'} Suggestions
              </Text>
              <Ionicons 
                name={showQuickAdd ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#FFFFFF" 
              />
            </Pressable>
          </View>

          {showQuickAdd && (
            <View className="space-y-3">
              {/* Favorites */}
              {favoriteMeals.length > 0 && (
                <View>
                  <Text className="text-white/80 text-sm font-medium mb-2">Your Favorites</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row space-x-2">
                      {favoriteMeals.map((meal, index) => (
                        <Pressable
                          key={index}
                          onPress={() => handleQuickAdd(meal)}
                          className="bg-white/20 rounded-lg p-3 min-w-[120px]"
                        >
                          <View className="flex-row items-center mb-1">
                            <Ionicons 
                              name={getMealTypeIcon(meal.mealType) as any} 
                              size={14} 
                              color="#FFFFFF" 
                            />
                            <Text className="text-white text-xs ml-1 capitalize">
                              {meal.mealType}
                            </Text>
                          </View>
                          <Text className="text-white text-sm font-medium" numberOfLines={2}>
                            {meal.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Yesterday's Meals */}
              {yesterdayMeals.length > 0 && (
                <View>
                  <Text className="text-white/80 text-sm font-medium mb-2">Copy from Yesterday</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row space-x-2">
                      {yesterdayMeals.map((meal, index) => (
                        <Pressable
                          key={index}
                          onPress={() => handleQuickAdd(meal)}
                          className="bg-white/20 rounded-lg p-3 min-w-[120px]"
                        >
                          <View className="flex-row items-center mb-1">
                            <Ionicons 
                              name={getMealTypeIcon(meal.mealType) as any} 
                              size={14} 
                              color="#FFFFFF" 
                            />
                            <Text className="text-white text-xs ml-1 capitalize">
                              {meal.mealType}
                            </Text>
                          </View>
                          <Text className="text-white text-sm font-medium" numberOfLines={2}>
                            {meal.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Last Week's Meals */}
              {lastWeekMeals.length > 0 && (
                <View>
                  <Text className="text-white/80 text-sm font-medium mb-2">Copy from Last Week</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row space-x-2">
                      {lastWeekMeals.map((meal, index) => (
                        <Pressable
                          key={index}
                          onPress={() => handleQuickAdd(meal)}
                          className="bg-white/20 rounded-lg p-3 min-w-[120px]"
                        >
                          <View className="flex-row items-center mb-1">
                            <Ionicons 
                              name={getMealTypeIcon(meal.mealType) as any} 
                              size={14} 
                              color="#FFFFFF" 
                            />
                            <Text className="text-white text-xs ml-1 capitalize">
                              {meal.mealType}
                            </Text>
                          </View>
                          <Text className="text-white text-sm font-medium" numberOfLines={2}>
                            {meal.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>

        <Input
          label="Meal Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter meal name"
          autoFocus
        />

        <Input
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter meal description"
          multiline
          numberOfLines={2}
        />

        {/* Date Picker */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-white mb-2">Date</Text>
          <Pressable
            onPress={() => {
              if (Platform.OS === "android") {
                DateTimePickerAndroid.open({
                  mode: "date",
                  value: date,
                  onChange: (_event, selected) => {
                    if (selected) setDate(selected);
                  },
                });
              } else {
                setShowDatePicker(true);
              }
            }}
            className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={20} color="rgba(255, 255, 255, 0.8)" />
              <Text className="text-white ml-3 text-base">{format(date, "PPP")}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="rgba(255, 255, 255, 0.6)" />
          </Pressable>
          {Platform.OS === "ios" && showDatePicker && (
            <DateTimePicker
              mode="date"
              value={date}
              onChange={(event, selected) => {
                setShowDatePicker(false);
                if (selected) setDate(selected);
              }}
              display="inline"
            />
          )}
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-white mb-2">
            Meal Type
          </Text>
          <View className="bg-white/5 border border-white/20 rounded-lg">
            <Picker
              style={{ color: "#FFFFFF" }}
              selectedValue={mealType}
              onValueChange={(value) => setMealType(value as MealType)}
            >
              <Picker.Item color="#FFFFFF" label="Breakfast" value="breakfast" />
              <Picker.Item color="#FFFFFF" label="Lunch" value="lunch" />
              <Picker.Item color="#FFFFFF" label="Dinner" value="dinner" />
              <Picker.Item color="#FFFFFF" label="Snack" value="snack" />
            </Picker>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-white mb-2">
            Category
          </Text>
          <View className="bg-white/5 border border-white/20 rounded-lg">
            <Picker
              style={{ color: "#FFFFFF" }}
              selectedValue={category}
              onValueChange={(value) => setCategory(value as MealCategory)}
            >
              <Picker.Item color="#FFFFFF" label="Healthy" value="healthy" />
              <Picker.Item color="#FFFFFF" label="Quick" value="quick" />
              <Picker.Item color="#FFFFFF" label="Comfort" value="comfort" />
              <Picker.Item color="#FFFFFF" label="Vegetarian" value="vegetarian" />
              <Picker.Item color="#FFFFFF" label="Vegan" value="vegan" />
              <Picker.Item color="#FFFFFF" label="Protein" value="protein" />
              <Picker.Item color="#FFFFFF" label="Other" value="other" />
            </Picker>
          </View>
        </View>

        {/* Dietary Badges */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-white mb-2">
            Dietary Badges (Optional)
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {dietaryBadges.map((badge) => (
              <Pressable
                key={badge}
                onPress={() => toggleBadge(badge)}
                className={`rounded-full px-3 py-2 flex-row items-center ${
                  selectedBadges.includes(badge) 
                    ? 'bg-primary' 
                    : 'bg-white/5 border border-white/20'
                }`}
              >
                <Text 
                  className={`text-xs font-medium capitalize ${
                    selectedBadges.includes(badge) ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {badge.replace('-', ' ')}
                </Text>
                {selectedBadges.includes(badge) && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={14} 
                    color="#FFFFFF" 
                    style={{ marginLeft: 4 }} 
                  />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View className="flex-row mb-4">
          <View className="flex-1 mr-3">
            <Input
              label="Prep Time (minutes)"
              value={prepTime}
              onChangeText={setPrepTime}
              placeholder="30"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Servings"
              value={servings}
              onChangeText={setServings}
              placeholder="4"
              keyboardType="numeric"
            />
          </View>
        </View>

        <Input
          label="Ingredients (Optional)"
          value={ingredients}
          onChangeText={setIngredients}
          placeholder="Ingredient 1, Ingredient 2, ..."
          helperText="Separate ingredients with commas"
          multiline
          numberOfLines={3}
        />

        <Input
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Special notes (e.g., 'Surprise: Grandma visiting!')"
          multiline
          numberOfLines={2}
        />

      </ScrollView>
    </Modal>
  );
}