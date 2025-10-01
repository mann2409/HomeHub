import useTaskStore from '../state/taskStore';
import useMealStore from '../state/mealStore';
import useFinanceStore from '../state/financeStore';
import useShoppingStore from '../state/shoppingStore';
import useNoteStore from '../state/noteStore';
import useSettingsStore from '../state/settingsStore';

export const syncUserData = (userId: string | null) => {
  // Update all stores with current user ID
  useTaskStore.getState().setUserId(userId);
  useMealStore.getState().setUserId(userId);
  useFinanceStore.getState().setUserId(userId);
  useShoppingStore.getState().setUserId(userId);
  useNoteStore.getState().setUserId(userId);
  useSettingsStore.getState().setUserId(userId);
};

export const clearAllUserData = () => {
  // Clear all user data from all stores
  useTaskStore.getState().clearUserData();
  useMealStore.getState().clearUserData();
  useFinanceStore.getState().clearUserData();
  useShoppingStore.getState().clearUserData();
  useNoteStore.getState().clearUserData();
  useSettingsStore.getState().clearUserData();
};
