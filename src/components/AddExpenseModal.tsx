import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Picker } from "@react-native-picker/picker";
import Modal from "./Modal";
import Input from "./Input";
import { ExpenseCategory, PaymentMethod } from "../types";
import useFinanceStore from "../state/financeStore";

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddExpenseModal({ visible, onClose }: AddExpenseModalProps) {
  const { addExpense } = useFinanceStore();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("other");
    setPaymentMethod("card");
    setDate(new Date());
    setShowDatePicker(false);
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !description.trim()) return;

    addExpense({
      amount: numAmount,
      description: description.trim(),
      category,
      date,
      paymentMethod,
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = amount && parseFloat(amount) > 0 && description.trim();

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="New Expense"
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


      </ScrollView>
    </Modal>
  );
}