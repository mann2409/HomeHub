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
          <Text className="text-sm font-medium text-white mb-2">
            Category
          </Text>
          <View className="bg-white/5 border border-white/20 rounded-lg">
            <Picker
              style={{ color: "#FFFFFF" }}
              selectedValue={category}
              onValueChange={(value) => setCategory(value as ShoppingCategory)}
            >
              <Picker.Item color="#FFFFFF" label="Produce" value="produce" />
              <Picker.Item color="#FFFFFF" label="Dairy" value="dairy" />
              <Picker.Item color="#FFFFFF" label="Meat" value="meat" />
              <Picker.Item color="#FFFFFF" label="Pantry" value="pantry" />
              <Picker.Item color="#FFFFFF" label="Frozen" value="frozen" />
              <Picker.Item color="#FFFFFF" label="Household" value="household" />
              <Picker.Item color="#FFFFFF" label="Personal Care" value="personal_care" />
              <Picker.Item color="#FFFFFF" label="Other" value="other" />
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
            <Text className="text-sm font-medium text-white mb-2">
              Priority
            </Text>
            <View className="bg-white/5 border border-white/20 rounded-lg">
              <Picker
              style={{ color: "#FFFFFF" }}
                selectedValue={priority}
                onValueChange={(value) => setPriority(value as Priority)}
              >
                <Picker.Item color="#FFFFFF" label="Low" value="low" />
                <Picker.Item color="#FFFFFF" label="Medium" value="medium" />
                <Picker.Item color="#FFFFFF" label="High" value="high" />
              </Picker>
            </View>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-white mb-2">
            Status
          </Text>
          <View className="bg-white/5 border border-white/20 rounded-lg">
            <Picker
              style={{ color: "#FFFFFF" }}
              selectedValue={completed}
              onValueChange={(value) => setCompleted(value)}
            >
              <Picker.Item color="#FFFFFF" label="Pending" value={false} />
              <Picker.Item color="#FFFFFF" label="Completed" value={true} />
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

        <View className="mt-6">
          <Button
            title="Delete Item"
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