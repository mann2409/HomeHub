import useTaskStore from '../state/taskStore';
import useMealStore from '../state/mealStore';
import useFinanceStore from '../state/financeStore';
import useShoppingStore from '../state/shoppingStore';
import useNoteStore from '../state/noteStore';
import useSettingsStore from '../state/settingsStore';
import useFamilyStore from '../state/familyStore';

export const syncUserData = (userId: string | null) => {
  // Update all stores with current user ID
  console.log('Syncing userId to all stores:', userId);
  useTaskStore.getState().setUserId(userId);
  useMealStore.getState().setUserId(userId);
  useFinanceStore.getState().setUserId(userId);
  useShoppingStore.getState().setUserId(userId);
  useNoteStore.getState().setUserId(userId);
  useSettingsStore.getState().setUserId(userId);
  useFamilyStore.getState().setUserId(userId);
};

export const clearAllUserData = () => {
  // Clear all user data from all stores
  useTaskStore.getState().clearUserData();
  useMealStore.getState().clearUserData();
  useFinanceStore.getState().clearUserData();
  useShoppingStore.getState().clearUserData();
  useNoteStore.getState().clearUserData();
  useSettingsStore.getState().clearUserData();
  useFamilyStore.getState().clearFamilyData();
};
