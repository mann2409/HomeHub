import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Modal from "./Modal";
import Input from "./Input";
import { MealType, MealCategory } from "../types";
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
  const { addMeal } = useMealStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [category, setCategory] = useState<MealCategory>("other");
  const [prepTime, setPrepTime] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setMealType(initialMealType);
    setCategory("other");
    setPrepTime("");
    setServings("");
    setIngredients("");
  };

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
      date: initialDate,
      ingredients: ingredientsList.length > 0 ? ingredientsList : undefined,
      servings: servings ? parseInt(servings) : undefined,
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      category,
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Meal Type
          </Text>
          <View className="bg-gray-50 border border-gray-200 rounded-lg">
            <Picker
              selectedValue={mealType}
              onValueChange={(value) => setMealType(value as MealType)}
            >
              <Picker.Item label="Breakfast" value="breakfast" />
              <Picker.Item label="Lunch" value="lunch" />
              <Picker.Item label="Dinner" value="dinner" />
              <Picker.Item label="Snack" value="snack" />
            </Picker>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Category
          </Text>
          <View className="bg-gray-50 border border-gray-200 rounded-lg">
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value as MealCategory)}
            >
              <Picker.Item label="Healthy" value="healthy" />
              <Picker.Item label="Quick" value="quick" />
              <Picker.Item label="Comfort" value="comfort" />
              <Picker.Item label="Vegetarian" value="vegetarian" />
              <Picker.Item label="Vegan" value="vegan" />
              <Picker.Item label="Protein" value="protein" />
              <Picker.Item label="Other" value="other" />
            </Picker>
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


      </ScrollView>
    </Modal>
  );
}