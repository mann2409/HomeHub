import React, { useState, useEffect } from "react";
import { ScrollView, Keyboard } from "react-native";
import Modal from "./Modal";
import Input from "./Input";
import PrioritySelector from "./PrioritySelector";
import CategorySelector from "./CategorySelector";
import Toast from "./Toast";
import { TaskCategory, Priority } from "../types";
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
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        dueDate,
        category,
        priority,
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