import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { Task, TaskCategory, Priority } from "../types";
import useTaskStore from "../state/taskStore";

interface EditTaskModalProps {
  visible: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function EditTaskModal({ visible, onClose, task }: EditTaskModalProps) {
  const { updateTask, deleteTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("personal");
  const [priority, setPriority] = useState<Priority>("medium");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setCategory(task.category);
      setPriority(task.priority);
      setCompleted(task.completed);
    }
  }, [task]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("personal");
    setPriority("medium");
    setCompleted(false);
  };

  const handleSave = () => {
    if (!task || !title.trim()) return;

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      completed,
    });

    resetForm();
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    
    deleteTask(task.id);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="Edit Task"
      size="md"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Input
          label="Task Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
          autoFocus
        />

        <Input
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter task description"
          multiline
          numberOfLines={3}
        />

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Category
          </Text>
          <View className="bg-gray-50 border border-gray-200 rounded-lg">
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value as TaskCategory)}
            >
              <Picker.Item label="Personal" value="personal" />
              <Picker.Item label="Work" value="work" />
              <Picker.Item label="Health" value="health" />
              <Picker.Item label="Home" value="home" />
              <Picker.Item label="Shopping" value="shopping" />
              <Picker.Item label="Finance" value="finance" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <View className="mb-4">
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

        <View className="mb-6">
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
            disabled={!title.trim()}
            className="flex-1"
          />
        </View>

        <Button
          title="Delete Task"
          variant="outline"
          onPress={handleDelete}
          className="border-red-200 bg-red-50"
          textClassName="text-red-600"
        />
      </ScrollView>
    </Modal>
  );
}