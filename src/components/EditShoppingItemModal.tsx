import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { ShoppingItem, ShoppingCategory, Priority } from "../types";
import useShoppingStore from "../state/shoppingStore";

interface EditShoppingItemModalProps {
  visible: boolean;
  onClose: () => void;
  item: ShoppingItem | null;
}

export default function EditShoppingItemModal({ visible, onClose, item }: EditShoppingItemModalProps) {
  const { updateItem, deleteItem, autoCategorizeName } = useShoppingStore();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState<ShoppingCategory>("other");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity.toString());
      setUnit(item.unit || "");
      setCategory(item.category);
      setEstimatedPrice(item.estimatedPrice?.toString() || "");
      setPriority(item.priority);
      setNotes(item.notes || "");
      setCompleted(item.completed);
    }
  }, [item]);

  const resetForm = () => {
    setName("");
    setQuantity("1");
    setUnit("");
    setCategory("other");
    setEstimatedPrice("");
    setPriority("medium");
    setNotes("");
    setCompleted(false);
  };

  const handleNameChange = (text: string) => {
    setName(text);
    // Auto-categorize when name changes
    if (text.trim()) {
      const suggestedCategory = autoCategorizeName(text);
      setCategory(suggestedCategory);
    }
  };

  const handleSave = () => {
    if (!item || !name.trim()) return;

    updateItem(item.id, {
      name: name.trim(),
      quantity: parseInt(quantity) || 1,
      unit: unit.trim() || undefined,
      category,
      estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
      priority,
      notes: notes.trim() || undefined,
      completed,
    });

    resetForm();
    onClose();
  };

  const handleDelete = () => {
    if (!item) return;
    
    deleteItem(item.id);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="Edit Shopping Item"
      size="md"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Input
          label="Item Name"
          value={name}
          onChangeText={handleNameChange}
          placeholder="Enter item name"
          autoFocus
        />

        <View className="flex-row mb-4">
          <View className="flex-1 mr-3">
            <Input
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Unit (Optional)"
              value={unit}
              onChangeText={setUnit}
              placeholder="pcs, lbs, etc."
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Category
          </Text>
          <View className="bg-gray-50 border border-gray-200 rounded-lg">
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value as ShoppingCategory)}
            >
              <Picker.Item label="Produce" value="produce" />
              <Picker.Item label="Dairy" value="dairy" />
              <Picker.Item label="Meat" value="meat" />
              <Picker.Item label="Pantry" value="pantry" />
              <Picker.Item label="Frozen" value="frozen" />
              <Picker.Item label="Household" value="household" />
              <Picker.Item label="Personal Care" value="personal_care" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <View className="flex-row mb-4">
          <View className="flex-1 mr-3">
            <Input
              label="Estimated Price (Optional)"
              value={estimatedPrice}
              onChangeText={setEstimatedPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Priority
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-lg">
              <Picker
                selectedValue={priority}
                onValueChange={(value) => setPriority(value as Priority)}
              >
                <Picker.Item label="Low" value="low" />
                <Picker.Item label="Medium" value="medium" />
                <Picker.Item label="High" value="high" />
              </Picker>
            </View>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Status
          </Text>
          <View className="bg-gray-50 border border-gray-200 rounded-lg">
            <Picker
              selectedValue={completed}
              onValueChange={(value) => setCompleted(value)}
            >
              <Picker.Item label="Pending" value={false} />
              <Picker.Item label="Completed" value={true} />
            </Picker>
          </View>
        </View>

        <Input
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes"
          multiline
          numberOfLines={2}
        />

        <View className="flex-row mb-4">
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleClose}
            className="flex-1 mr-3"
          />
          <Button
            title="Save Changes"
            onPress={handleSave}
            disabled={!name.trim()}
            className="flex-1"
          />
        </View>

        <Button
          title="Delete Item"
          variant="outline"
          onPress={handleDelete}
          className="border-red-200 bg-red-50"
          textClassName="text-red-600"
        />
      </ScrollView>
    </Modal>
  );
}