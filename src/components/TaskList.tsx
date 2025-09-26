import React from "react";
import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Task } from "../types";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onTaskPress?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  emptyMessage?: string;
}

export default function TaskList({ 
  tasks, 
  onToggleTask, 
  onTaskPress,
  onDeleteTask,
  emptyMessage = "No tasks for today"
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <View className="items-center justify-center py-8">
        <Text className="text-gray-500 text-center">
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 min-h-[200px]">
      <FlashList
        data={tasks}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={onToggleTask}
            onPress={onTaskPress}
            onDelete={onDeleteTask}
          />
        )}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}