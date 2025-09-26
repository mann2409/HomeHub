import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Picker } from "@react-native-picker/picker";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { Expense, ExpenseCategory, PaymentMethod } from "../types";
import useFinanceStore from "../state/financeStore";

interface EditExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export default function EditExpenseModal({ visible, onClose, expense }: EditExpenseModalProps) {
  const { updateExpense, deleteExpense } = useFinanceStore();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setDescription(expense.description);
      setCategory(expense.category);
      setPaymentMethod(expense.paymentMethod || "card");
      setDate(new Date(expense.date));
    }
  }, [expense]);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("other");
    setPaymentMethod("card");
  };

  const handleSave = () => {
    if (!expense) return;
    
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !description.trim()) return;

    updateExpense(expense.id, {
      amount: numAmount,
      description: description.trim(),
      category,
      date,
      paymentMethod,
    });

    resetForm();
    onClose();
  };

  const handleDelete = () => {
    if (!expense) return;
    
    deleteExpense(expense.id);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!expense) return null;

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="Edit Expense"
      navigationMode={true}
      leftButton={{ title: "Cancel", onPress: handleClose }}
      rightButton={{
        title: "Save",
        onPress: handleSave,
        disabled: !amount || !description.trim() || parseFloat(amount) <= 0,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Input
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          autoFocus
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What did you spend on?"
        />

        {/* Date */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Date</Text>
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
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
          >
            <Text className="text-gray-900">{format(date, "PPP")}</Text>
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
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Category
          </Text>
          <View className="bg-gray-50 border border-gray-200 rounded-lg">
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value as ExpenseCategory)}
            >
              <Picker.Item label="Food" value="food" />
              <Picker.Item label="Transport" value="transport" />
              <Picker.Item label="Utilities" value="utilities" />
              <Picker.Item label="Entertainment" value="entertainment" />
              <Picker.Item label="Health" value="health" />
              <Picker.Item label="Shopping" value="shopping" />
              <Picker.Item label="Home" value="home" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </Text>
          <View className="bg-gray-50 border border-gray-200 rounded-lg">
            <Picker
              selectedValue={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <Picker.Item label="Card" value="card" />
              <Picker.Item label="Cash" value="cash" />
              <Picker.Item label="Bank Transfer" value="bank_transfer" />
              <Picker.Item label="Digital Wallet" value="digital_wallet" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <Button
          title="Delete Expense"
          variant="outline"
          onPress={handleDelete}
          className="border-red-200 bg-red-50"
          textClassName="text-red-600"
        />
      </ScrollView>
    </Modal>
  );
}