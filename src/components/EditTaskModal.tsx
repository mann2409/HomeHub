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
          <Text className="text-sm font-medium text-white mb-2">
            Category
          </Text>
          <View className="bg-white/5 border border-white/20 rounded-lg">
            <Picker
              style={{ color: "#FFFFFF" }}
              selectedValue={category}
              onValueChange={(value) => setCategory(value as TaskCategory)}
            >
              <Picker.Item color="#FFFFFF" label="Personal" value="personal" />
              <Picker.Item color="#FFFFFF" label="Work" value="work" />
              <Picker.Item color="#FFFFFF" label="Health" value="health" />
              <Picker.Item color="#FFFFFF" label="Home" value="home" />
              <Picker.Item color="#FFFFFF" label="Shopping" value="shopping" />
              <Picker.Item color="#FFFFFF" label="Finance" value="finance" />
              <Picker.Item color="#FFFFFF" label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <View className="mb-4">
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

        <View className="mb-6">
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