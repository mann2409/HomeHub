import { useEffect } from 'react';
import useFamilyStore from '../state/familyStore';
import useTaskStore from '../state/taskStore';
import useShoppingStore from '../state/shoppingStore';
import useMealStore from '../state/mealStore';
import { useAuthStore } from '../state/authStore';

/**
 * Hook to sync family data with Firestore in real-time
 * Call this once in your App.tsx or main component
 */
export function useFamilySync() {
  const { user } = useAuthStore();
  const { activeFamilyId, migrateFamilyData, loadUserFamilies, currentUserId, setUserId, subscribeToFamily } = useFamilyStore();
  const { subscribeToFamilyTasks } = useTaskStore();
  const { subscribeToFamilyShopping } = useShoppingStore();
  const { subscribeToFamilyMeals } = useMealStore();

  // Load user's families when they log in
  useEffect(() => {
    if (user?.uid && user.uid !== currentUserId) {
      console.log('User logged in, loading their families:', user.uid);
      setUserId(user.uid);
      loadUserFamilies(user.uid).catch(err => 
        console.error('Failed to load user families:', err)
      );
    } else if (!user) {
      // User logged out
      setUserId(null);
    }
  }, [user?.uid, currentUserId, setUserId, loadUserFamilies]);

  // Subscribe to active family's data
  useEffect(() => {
    if (!activeFamilyId) {
      console.log('No active family - not subscribing to tasks');
      return;
    }

    console.log('Subscribing to family data for:', activeFamilyId);
    
    // Run migration for existing data (adds status field if missing)
    migrateFamilyData(activeFamilyId).catch(err => 
      console.error('Migration failed:', err)
    );
    
    // Subscribe to family data (members, name, etc.)
    const unsubscribeFamily = subscribeToFamily(activeFamilyId);
    
    // Subscribe to tasks
    const unsubscribeTasks = subscribeToFamilyTasks(activeFamilyId);
    
    // Subscribe to shopping
    const unsubscribeShopping = subscribeToFamilyShopping(activeFamilyId);
    
    // Subscribe to meals
    const unsubscribeMeals = subscribeToFamilyMeals(activeFamilyId);

    // TODO: Subscribe to expenses, notes when implemented

    return () => {
      console.log('Unsubscribing from family data');
      unsubscribeFamily();
      unsubscribeTasks();
      unsubscribeShopping();
      unsubscribeMeals();
    };
  }, [activeFamilyId, migrateFamilyData, subscribeToFamily, subscribeToFamilyTasks, subscribeToFamilyShopping, subscribeToFamilyMeals]);
}

