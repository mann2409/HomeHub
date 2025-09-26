import React, { useState } from "react";
import { View, Text } from "react-native";
import Card from "./Card";
import QuickAccessWidget from "./QuickAccessWidget";
import { CheckCircle, CreditCard, Basket, Note } from "phosphor-react-native";
import AddTaskModal from "./AddTaskModal";
import AddExpenseModal from "./AddExpenseModal";
import AddShoppingItemModal from "./AddShoppingItemModal";
import QuickNoteModal from "./QuickNoteModal";

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  action: string;
}

// Prioritized order: task, expense, shopping, note
const defaultActions: QuickAction[] = [
  {
    id: "add_task",
    title: "Add Task",
    icon: <CheckCircle size={28} weight="regular" color="#3B82F6" />,
    color: "#3B82F6",
    action: "add_task",
  },
  {
    id: "add_expense",
    title: "Add Expense",
    icon: <CreditCard size={28} weight="regular" color="#EF4444" />,
    color: "#EF4444",
    action: "add_expense",
  },
  {
    id: "shopping_list",
    title: "Shopping Item",
    icon: <Basket size={28} weight="regular" color="#10B981" />,
    color: "#10B981",
    action: "add_shopping",
  },
  {
    id: "quick_note",
    title: "Quick Note",
    icon: <Note size={28} weight="regular" color="#F59E0B" />,
    color: "#F59E0B",
    action: "quick_note",
  },
];

export default function QuickAccessGrid() {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const handleWidgetPress = (action: string) => {
    switch (action) {
      case "add_task":
        setShowTaskModal(true);
        break;
      case "add_expense":
        setShowExpenseModal(true);
        break;
      case "add_shopping":
        setShowShoppingModal(true);
        break;
      case "quick_note":
        setShowNoteModal(true);
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  return (
    <>
      <Card className="mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Quick Access
        </Text>
        
        <View className="flex-row flex-wrap -mx-2">
          {defaultActions.map((action) => (
            <View key={action.id} className={action.id === "add_task" ? "w-full px-2 mb-4" : "w-1/2 px-2 mb-4"}>
              <QuickAccessWidget
                title={action.title}
                iconNode={action.icon}
                color={action.color}
                onPress={() => handleWidgetPress(action.action)}
                size={action.id === "add_task" ? "large" : "medium"}
              />
            </View>
          ))}
        </View>

        {/* Quick Stats */}
        <View className="mt-4 pt-4 border-t border-gray-100">
          <Text className="text-xs text-gray-500 text-center">
            Tap any widget to quickly add items to your HomeBoard
          </Text>
        </View>
      </Card>

      {/* Modals */}
      <AddTaskModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
      />
      
      <AddExpenseModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />
      
      <AddShoppingItemModal
        visible={showShoppingModal}
        onClose={() => setShowShoppingModal(false)}
      />
      
      <QuickNoteModal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
      />
    </>
  );
}