import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./Card";
import HorizontalCalendar from "./HorizontalCalendar";
import TaskList from "./TaskList";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import useTaskStore from "../state/taskStore";
import { Task } from "../types";

export default function CalendarTasksModule() {
  const { getTasksByDate, toggleTask, deleteTask } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasksForDate = getTasksByDate(selectedDate);

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  return (
    <>
      <Card className="mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            Calendar & Tasks
          </Text>
          <Pressable
            onPress={() => setShowAddModal(true)}
            className="w-8 h-8 bg-primary rounded-full items-center justify-center"
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <HorizontalCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        <View className="border-t border-gray-100 pt-4">
          <Text className="text-base font-medium text-gray-900 mb-3">
            Tasks for {selectedDate.toLocaleDateString()}
          </Text>
          
          <TaskList
            tasks={tasksForDate}
            onToggleTask={toggleTask}
            onTaskPress={handleTaskPress}
            onDeleteTask={deleteTask}
            emptyMessage="No tasks for this day"
          />
        </View>
      </Card>

      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        initialDate={selectedDate}
      />

      <EditTaskModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </>
  );
}