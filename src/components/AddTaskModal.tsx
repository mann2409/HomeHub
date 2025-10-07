import React, { useState, useEffect } from "react";
import { ScrollView, Keyboard, Platform, View, Text, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Modal from "./Modal";
import Input from "./Input";
import PrioritySelector from "./PrioritySelector";
import CategorySelector from "./CategorySelector";
import RepeatSelector from "./RepeatSelector";
import Toast from "./Toast";
import { TaskCategory, Priority, RecurrenceRule } from "../types";
import useTaskStore from "../state/taskStore";

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: Date;
}

export default function AddTaskModal({ visible, onClose, initialDate }: AddTaskModalProps) {
  const { addTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("personal");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState(initialDate || new Date());
  const [recurring, setRecurring] = useState<RecurrenceRule | undefined>(undefined);
  const [time, setTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Auto-focus management
  useEffect(() => {
    if (visible) {
      // Clear any previous errors when modal opens
      setTitleError("");
    }
  }, [visible]);

  // Keep dueDate in sync with the selected date from the calendar when opening
  useEffect(() => {
    if (visible) {
      setDueDate(initialDate || new Date());
    }
  }, [initialDate, visible]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("personal");
    setPriority("medium");
    setDueDate(initialDate || new Date());
    setRecurring(undefined);
    setTime(null);
  };

  const validateForm = () => {
    if (!title.trim()) {
      setTitleError("Task title is required");
      return false;
    }
    if (title.trim().length > 100) {
      setTitleError("Task title must be less than 100 characters");
      return false;
    }
    setTitleError("");
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Combine selected date with optional time
      const combinedDueDate = (() => {
        if (!dueDate) return undefined;
        if (!time) return dueDate;
        const d = new Date(dueDate);
        d.setHours(time.getHours(), time.getMinutes(), 0, 0);
        return d;
      })();

      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        dueDate: combinedDueDate,
        category,
        priority,
        recurring,
      });

      resetForm();
      onClose();
      
      // Show success feedback
      setToastMessage("Task created successfully!");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      setToastMessage("Failed to create task. Please try again.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        onClose={handleClose}
        title="New Task"
        navigationMode={true}
        leftButton={{
          title: "Cancel",
          onPress: handleClose,
        }}
        rightButton={{
          title: "Save",
          onPress: handleSave,
          disabled: !title.trim() || isLoading,
          loading: isLoading,
        }}
      >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (titleError) setTitleError("");
          }}
          placeholder="Task title"
          autoFocus
          required
          maxLength={100}
          showCharacterCount
          error={titleError}
          keyboardType="default"
          returnKeyType="next"
        />

        <Input
          label="Notes"
          value={description}
          onChangeText={setDescription}
          placeholder="Add notes..."
          multiline
          numberOfLines={3}
          maxLength={500}
          showCharacterCount
          textAlignVertical="top"
        />

        <CategorySelector
          value={category}
          onChange={setCategory}
        />

        <PrioritySelector
          value={priority}
          onChange={setPriority}
        />

        <RepeatSelector
          value={recurring}
          onChange={setRecurring}
        />

        {/* Time selection */}
        <View className="mt-3">
          <Text className="text-white/80 mb-2">Time (optional)</Text>
          <Pressable
            onPress={() => setShowTimePicker(true)}
            className="py-3 px-4 rounded-lg border border-white/20 bg-white/5"
          >
            <Text className="text-white">
              {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select time'}
            </Text>
          </Pressable>

          {showTimePicker && (
            <DateTimePicker
              value={time || dueDate || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              {...(Platform.OS === 'ios' ? { textColor: '#FFFFFF' } : {})}
              onChange={(event: any, selected?: Date) => {
                if (Platform.OS !== 'ios') setShowTimePicker(false);
                if (event.type === 'dismissed') return;
                if (selected) {
                  const picked = new Date(selected);
                  picked.setSeconds(0, 0);
                  setTime(picked);
                }
              }}
              onTouchCancel={() => setShowTimePicker(false)}
            />
          )}
        </View>
      </ScrollView>
      </Modal>

      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </>
  );
}