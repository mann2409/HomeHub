import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Picker } from "@react-native-picker/picker";
import Modal from "./Modal";
import Input from "./Input";
import { ExpenseCategory, PaymentMethod } from "../types";
import useFinanceStore from "../state/financeStore";
import { guideBus } from "../utils/guideBus";

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
        {amount && parseFloat(amount) > 0 && guideBus.emit({ type: 'ui:modal:expense:amountFilled' })}

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What did you spend on?"
        />

        {/* Date */}
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
            className="bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          >
            <Text className="text-white">{format(date, "PPP")}</Text>
          </Pressable>
          {Platform.OS === "ios" && showDatePicker && (
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 8 }}>
              <DateTimePicker
                mode="date"
                value={date}
                onChange={(event, selected) => {
                  setShowDatePicker(false);
                  if (selected) setDate(selected);
                }}
                display="inline"
                themeVariant="dark"
                textColor="#FFFFFF"
                accentColor="#3B82F6"
              />
            </View>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-white mb-2">
            Category
          </Text>
          <View className="bg-white/5 border border-white/20 rounded-lg">
            <Picker
              style={{ color: "#FFFFFF" }}
              selectedValue={category}
              onValueChange={(value) => setCategory(value as ExpenseCategory)}
            >
              <Picker.Item color="#FFFFFF" label="Food" value="food" />
              <Picker.Item color="#FFFFFF" label="Transport" value="transport" />
              <Picker.Item color="#FFFFFF" label="Utilities" value="utilities" />
              <Picker.Item color="#FFFFFF" label="Entertainment" value="entertainment" />
              <Picker.Item color="#FFFFFF" label="Health" value="health" />
              <Picker.Item color="#FFFFFF" label="Shopping" value="shopping" />
              <Picker.Item color="#FFFFFF" label="Home" value="home" />
              <Picker.Item color="#FFFFFF" label="Education and training" value="education" />
              <Picker.Item color="#FFFFFF" label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-white mb-2">
            Payment Method
          </Text>
          <View className="bg-white/5 border border-white/20 rounded-lg">
            <Picker
              style={{ color: "#FFFFFF" }}
              selectedValue={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <Picker.Item color="#FFFFFF" label="Card" value="card" />
              <Picker.Item color="#FFFFFF" label="Cash" value="cash" />
              <Picker.Item color="#FFFFFF" label="Bank Transfer" value="bank_transfer" />
              <Picker.Item color="#FFFFFF" label="Digital Wallet" value="digital_wallet" />
              <Picker.Item color="#FFFFFF" label="Other" value="other" />
            </Picker>
          </View>
        </View>


      </ScrollView>
    </Modal>
  );
}