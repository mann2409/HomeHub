import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { Meal, MealType, MealCategory, DietaryBadge } from "../types";
import useMealStore from "../state/mealStore";

interface EditMealModalProps {
  visible: boolean;
  onClose: () => void;
  meal: Meal | null;
}

export default function EditMealModal({ visible, onClose, meal }: EditMealModalProps) {
  const { updateMeal, deleteMeal } = useMealStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [category, setCategory] = useState<MealCategory>("other");
  const [prepTime, setPrepTime] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedBadges, setSelectedBadges] = useState<DietaryBadge[]>([]);

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

  useEffect(() => {
    if (meal) {
      setName(meal.name);
      setDescription(meal.description || "");
      setMealType(meal.mealType);
      setCategory(meal.category);
      setPrepTime(meal.prepTime?.toString() || "");
      setServings(meal.servings?.toString() || "");
      setIngredients(meal.ingredients?.join(", ") || "");
      setNotes(meal.notes || "");
      setSelectedBadges(meal.dietaryBadges || []);
    }
  }, [meal]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setMealType("breakfast");
    setCategory("other");
    setPrepTime("");
    setServings("");
    setIngredients("");
    setNotes("");
    setSelectedBadges([]);
  };

  const handleSave = () => {
    if (!meal || !name.trim()) return;

    const ingredientsList = ingredients
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);

    updateMeal(meal.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      mealType,
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

  const handleDelete = () => {
    if (!meal) return;
    
    deleteMeal(meal.id);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleBadge = (badge: DietaryBadge) => {
    if (selectedBadges.includes(badge)) {
      setSelectedBadges(selectedBadges.filter(b => b !== badge));
    } else {
      setSelectedBadges([...selectedBadges, badge]);
    }
  };

  if (!meal) return null;

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="Edit Meal"
      navigationMode={true}
      leftButton={{
        title: "Cancel",
        onPress: handleClose,
      }}
      rightButton={{
        title: "Save",
        onPress: handleSave,
        disabled: !name.trim(),
      }}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
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

        <View className="mt-6">
          <Button
            title="Delete Meal"
            variant="outline"
            onPress={handleDelete}
            className="border-red-200 bg-red-50"
            textClassName="text-red-600"
          />
        </View>
      </ScrollView>
    </Modal>
  );
}