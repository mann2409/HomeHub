import React, { useState } from "react";
import { View, Text, Modal as RNModal } from "react-native";
import Card from "./Card";
import QuickAccessWidget from "./QuickAccessWidget";
import { CheckCircle, CreditCard, ShoppingCart, ChatCircleDots } from "phosphor-react-native";
import AddTaskModal from "./AddTaskModal";
import AddExpenseModal from "./AddExpenseModal";
import AddShoppingItemModal from "./AddShoppingItemModal";
import ChatGPTBrowserScreen from "../screens/ChatGPTBrowserScreen";
import { guideBus } from "../utils/guideBus";

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  action: string;
}

// Prioritized order: task, expense, shopping, chatgpt
const defaultActions: QuickAction[] = [
  {
    id: "add_task",
    title: "Add Task",
    icon: <CheckCircle size={32} weight="bold" color="#3B82F6" />,
    color: "#3B82F6", // Blue
    action: "add_task",
  },
  {
    id: "add_expense",
    title: "Add Expense",
    icon: <CreditCard size={32} weight="bold" color="#8B5CF6" />,
    color: "#8B5CF6", // Purple
    action: "add_expense",
  },
  {
    id: "shopping_list",
    title: "Shopping Item",
    icon: <ShoppingCart size={32} weight="bold" color="#EC4899" />,
    color: "#EC4899", // Pink
    action: "add_shopping",
  },
  {
    id: "chatgpt",
    title: "ChatGPT",
    icon: <ChatCircleDots size={32} weight="bold" color="#10A37F" />,
    color: "#10A37F", // OpenAI Green
    action: "open_chatgpt",
  },
];

export default function QuickAccessGrid() {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showChatGPT, setShowChatGPT] = useState(false);

  const handleWidgetPress = (action: string) => {
    switch (action) {
      case "add_task":
        setShowTaskModal(true);
        guideBus.emit({ type: 'ui:press:addTask' });
        break;
      case "add_expense":
        setShowExpenseModal(true);
        guideBus.emit({ type: 'ui:press:addExpense' });
        break;
      case "add_shopping":
        setShowShoppingModal(true);
        break;
      case "open_chatgpt":
        setShowChatGPT(true);
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  return (
    <>
      <Card variant="pink" className="mb-4">
        <Text className="text-lg font-semibold text-white mb-4">
          Quick Access
        </Text>
        
        <View className="flex-row flex-wrap -mx-2">
          {defaultActions.map((action) => (
            <View key={action.id} className="w-1/2 px-2 mb-6">
              <QuickAccessWidget
                title={action.title}
                iconNode={action.icon}
                color={action.color}
                onPress={() => handleWidgetPress(action.action)}
                size="medium"
              />
            </View>
          ))}
        </View>

        {/* Quick Stats */}
        <View className="mt-4 pt-4 border-t border-white/20">
          <Text className="text-xs text-white/80 text-center">
            Tap any widget for quick actions or chat with AI
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

      {/* ChatGPT Browser Modal */}
      {showChatGPT && (
        <RNModal
          visible={showChatGPT}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowChatGPT(false)}
        >
          <ChatGPTBrowserScreen onClose={() => setShowChatGPT(false)} />
        </RNModal>
      )}
    </>
  );
}