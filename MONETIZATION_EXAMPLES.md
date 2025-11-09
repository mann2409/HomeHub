# Monetization Code Examples

This guide shows you how to add more ads and premium features throughout your app.

---

## 🎯 Adding Interstitial Ads

### Example 1: Show Ad After Multiple Actions
```typescript
// In src/state/taskStore.ts or any store

import { showInterstitialAd } from '../components/InterstitialAdManager';
import useSubscriptionStore from './subscriptionStore';

let actionCount = 0;

addTask: async (taskData) => {
  // ... your existing code ...
  
  // Increment action counter
  actionCount++;
  
  // Show ad every 5 tasks added
  if (actionCount % 5 === 0) {
    const { isPremium } = useSubscriptionStore.getState();
    if (!isPremium) {
      // Small delay so user sees their task was added
      setTimeout(() => {
        showInterstitialAd();
      }, 500);
    }
  }
},
```

### Example 2: Show Ad When Viewing Details
```typescript
// In any screen component

import { useEffect } from 'react';
import { useInterstitialAd } from '../components/InterstitialAdManager';
import useSubscriptionStore from '../state/subscriptionStore';

export default function DetailScreen() {
  const { isPremium } = useSubscriptionStore();
  const { showAd } = useInterstitialAd();
  
  useEffect(() => {
    // Show ad when user views details (not too often)
    const shouldShowAd = Math.random() < 0.3; // 30% chance
    
    if (!isPremium && shouldShowAd) {
      // Delay to let screen load first
      setTimeout(() => {
        showAd();
      }, 1000);
    }
  }, []);
  
  // ... rest of component
}
```

### Example 3: Show Ad When Exporting Data
```typescript
// In SettingsScreen.tsx

const handleExportData = async () => {
  try {
    const exportData = {
      tasks,
      meals,
      expenses,
      shoppingItems: items,
      notes,
    };
    
    const fileUri = await exportAllDataToJson(exportData);
    
    // Show ad after successful export (free users only)
    if (!isPremium) {
      await showInterstitialAd();
    }
    
    Alert.alert("Export Complete", "Your data has been exported!");
  } catch (error) {
    console.error("Export failed:", error);
  }
};
```

---

## 📺 Adding More Banner Ads

### Example 1: Banner in Calendar Screen
```typescript
// src/screens/CalendarScreen.tsx

import AdBanner from '../components/AdBanner';

export default function CalendarScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Your existing content */}
      <ScrollView>
        {/* ... calendar content ... */}
      </ScrollView>
      
      {/* Add banner at bottom */}
      <AdBanner />
    </View>
  );
}
```

### Example 2: Banner in Meals Screen
```typescript
// src/screens/MealsScreen.tsx

import AdBanner from '../components/AdBanner';
import { BannerAdSize } from 'react-native-google-mobile-ads';

export default function MealsScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {/* ... meals content ... */}
        
        {/* Add banner in the middle */}
        <View style={{ marginVertical: 20 }}>
          <AdBanner size={BannerAdSize.MEDIUM_RECTANGLE} />
        </View>
        
        {/* ... more content ... */}
      </ScrollView>
    </View>
  );
}
```

---

## 💎 Adding Premium-Only Features

### Example 1: Advanced Analytics (Premium Only)
```typescript
// src/screens/FinanceScreen.tsx

import useSubscriptionStore from '../state/subscriptionStore';

export default function FinanceScreen() {
  const { isPremium } = useSubscriptionStore();
  
  const showAdvancedAnalytics = () => {
    if (!isPremium) {
      Alert.alert(
        '⭐ Premium Feature',
        'Advanced analytics are only available for Premium members.',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { 
            text: 'Upgrade Now', 
            onPress: () => navigation.navigate('Premium') 
          }
        ]
      );
      return;
    }
    
    // Show advanced analytics
    navigation.navigate('AdvancedAnalytics');
  };
  
  return (
    <View>
      {/* ... existing content ... */}
      
      <TouchableOpacity onPress={showAdvancedAnalytics}>
        <View className="flex-row items-center">
          <Text>Advanced Analytics</Text>
          {!isPremium && (
            <View className="bg-yellow-500 px-2 py-1 rounded ml-2">
              <Text className="text-xs font-bold">PREMIUM</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
```

### Example 2: Export Limit (Free vs Premium)
```typescript
// In SettingsScreen.tsx

const [exportCount, setExportCount] = useState(0);
const FREE_EXPORT_LIMIT = 3;

const handleExportData = async () => {
  // Check export limit for free users
  if (!isPremium && exportCount >= FREE_EXPORT_LIMIT) {
    Alert.alert(
      '⭐ Export Limit Reached',
      `Free users can export ${FREE_EXPORT_LIMIT} times per month. Upgrade to Premium for unlimited exports!`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Upgrade Now', onPress: () => setShowPremium(true) }
      ]
    );
    return;
  }
  
  try {
    const exportData = { tasks, meals, expenses, items, notes };
    await exportAllDataToJson(exportData);
    
    // Increment counter for free users
    if (!isPremium) {
      setExportCount(prev => prev + 1);
    }
    
    Alert.alert("Export Complete", "Your data has been exported!");
  } catch (error) {
    console.error("Export failed:", error);
  }
};
```

### Example 3: Task Limit (Free vs Premium)
```typescript
// src/state/taskStore.ts

import useSubscriptionStore from './subscriptionStore';
import { Alert } from 'react-native';

const FREE_TASK_LIMIT = 50;

addTask: (taskData) => {
  const { isPremium } = useSubscriptionStore.getState();
  const { tasks } = get();
  
  // Check limit for free users
  if (!isPremium && tasks.length >= FREE_TASK_LIMIT) {
    Alert.alert(
      '⭐ Task Limit Reached',
      `Free users can create up to ${FREE_TASK_LIMIT} tasks. Upgrade to Premium for unlimited tasks!`,
      [
        { text: 'OK', style: 'cancel' }
      ]
    );
    return;
  }
  
  // ... rest of your addTask logic ...
},
```

### Example 4: Theme Customization (Premium Only)
```typescript
// src/components/ThemeSelector.tsx

import useSubscriptionStore from '../state/subscriptionStore';

const PREMIUM_THEMES = ['ocean', 'sunset', 'forest', 'midnight'];
const FREE_THEMES = ['default', 'dark'];

export default function ThemeSelector() {
  const { isPremium } = useSubscriptionStore();
  const { theme, setTheme } = useSettingsStore();
  
  const handleThemeSelect = (selectedTheme: string) => {
    if (PREMIUM_THEMES.includes(selectedTheme) && !isPremium) {
      Alert.alert(
        '⭐ Premium Theme',
        'This beautiful theme is only available for Premium members.',
        [
          { text: 'Use Default', style: 'cancel' },
          { text: 'Upgrade Now', onPress: () => navigation.navigate('Premium') }
        ]
      );
      return;
    }
    
    setTheme(selectedTheme);
  };
  
  return (
    <View>
      {ALL_THEMES.map(themeOption => (
        <ThemeOption
          key={themeOption}
          name={themeOption}
          onSelect={handleThemeSelect}
          isPremium={PREMIUM_THEMES.includes(themeOption)}
          isLocked={PREMIUM_THEMES.includes(themeOption) && !isPremium}
        />
      ))}
    </View>
  );
}
```

---

## 🎁 Premium Feature Ideas

Here are features you could make premium-only:

1. **Unlimited Items**
   - Free: 50 tasks, 30 meals, 100 expenses
   - Premium: Unlimited

2. **Advanced Analytics**
   - Free: Basic stats
   - Premium: Charts, trends, predictions

3. **Data Export**
   - Free: 3 exports per month
   - Premium: Unlimited exports

4. **Custom Themes**
   - Free: 2-3 basic themes
   - Premium: 10+ beautiful themes

5. **Family Sharing**
   - Free: Solo use
   - Premium: Up to 6 family members

6. **Priority Support**
   - Free: Community support
   - Premium: Email support within 24h

7. **Cloud Backup**
   - Free: Local storage only
   - Premium: Automatic cloud backup

8. **AI Features**
   - Free: Basic suggestions
   - Premium: Advanced AI recommendations

9. **Recurring Tasks**
   - Free: Basic repeating tasks
   - Premium: Advanced recurrence patterns

10. **Widgets**
    - Free: Basic widgets
    - Premium: Advanced customizable widgets

---

## 🎨 Premium Badge Component

Create a reusable badge for premium features:

```typescript
// src/components/PremiumBadge.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { Crown } from 'phosphor-react-native';

export default function PremiumBadge({ size = 'small' }) {
  const isSmall = size === 'small';
  
  return (
    <View 
      className={`bg-yellow-500/20 flex-row items-center rounded-full ${
        isSmall ? 'px-2 py-1' : 'px-3 py-1.5'
      }`}
    >
      <Crown 
        size={isSmall ? 12 : 16} 
        color="#FFD700" 
        weight="fill" 
      />
      <Text 
        className={`text-yellow-400 font-bold ml-1 ${
          isSmall ? 'text-xs' : 'text-sm'
        }`}
      >
        PREMIUM
      </Text>
    </View>
  );
}

// Usage:
<PremiumBadge />
<PremiumBadge size="large" />
```

---

## 🔔 Smart Upgrade Prompts

### Show Upgrade Prompt at Right Time
```typescript
// src/hooks/useUpgradePrompt.ts

import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSubscriptionStore from '../state/subscriptionStore';

export function useUpgradePrompt() {
  const { isPremium } = useSubscriptionStore();
  
  useEffect(() => {
    const checkAndShowUpgradePrompt = async () => {
      if (isPremium) return;
      
      // Get usage stats
      const launchCount = await AsyncStorage.getItem('app_launch_count');
      const tasksCreated = await AsyncStorage.getItem('tasks_created_count');
      const lastPromptDate = await AsyncStorage.getItem('last_upgrade_prompt');
      
      const launches = parseInt(launchCount || '0');
      const tasks = parseInt(tasksCreated || '0');
      
      // Show prompt if:
      // - User has launched app 5+ times
      // - User has created 10+ tasks
      // - Haven't shown prompt in last 3 days
      
      const shouldShow = launches >= 5 && 
                        tasks >= 10 && 
                        (!lastPromptDate || daysSince(lastPromptDate) >= 3);
      
      if (shouldShow) {
        Alert.alert(
          '🎉 Loving HomeHub?',
          'Upgrade to Premium for an ad-free experience and unlimited features!',
          [
            { 
              text: 'Maybe Later', 
              onPress: () => AsyncStorage.setItem('last_upgrade_prompt', new Date().toISOString())
            },
            { 
              text: 'See Plans', 
              onPress: () => {
                AsyncStorage.setItem('last_upgrade_prompt', new Date().toISOString());
                navigation.navigate('Premium');
              }
            }
          ]
        );
      }
    };
    
    checkAndShowUpgradePrompt();
  }, [isPremium]);
}

// Use in App.tsx or main screen
useUpgradePrompt();
```

---

## 📊 Track Usage for Optimization

```typescript
// src/utils/analytics.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export const trackEvent = async (eventName: string, data?: any) => {
  // Track in your analytics (Firebase, Mixpanel, etc.)
  console.log('Event:', eventName, data);
  
  // Update local counters
  if (eventName === 'task_created') {
    const count = await AsyncStorage.getItem('tasks_created_count');
    await AsyncStorage.setItem('tasks_created_count', String(parseInt(count || '0') + 1));
  }
  
  if (eventName === 'app_launch') {
    const count = await AsyncStorage.getItem('app_launch_count');
    await AsyncStorage.setItem('app_launch_count', String(parseInt(count || '0') + 1));
  }
  
  if (eventName === 'upgrade_prompt_shown') {
    await AsyncStorage.setItem('last_upgrade_prompt', new Date().toISOString());
  }
  
  if (eventName === 'premium_purchased') {
    // Celebrate!
    console.log('🎉 New premium user!');
  }
};
```

---

## 🎯 Best Practices

### DO:
✅ Show upgrade prompts after users see value (3-5 days)
✅ Make premium benefits clear and compelling
✅ Keep free version functional and useful
✅ Hide ads completely for premium users
✅ Test different price points
✅ Offer free trial (7 days recommended)

### DON'T:
❌ Show ads too frequently (users will uninstall)
❌ Lock essential features behind paywall
❌ Prompt for upgrade on first launch
❌ Show ads during critical workflows
❌ Make free version feel broken
❌ Interrupt users with constant upgrade prompts

---

## 💡 Pro Tips

1. **Start Conservative**: Begin with fewer ads, add more based on metrics
2. **Monitor Metrics**: Track ad revenue vs user retention
3. **A/B Test**: Try different ad placements and frequencies
4. **Value First**: Focus on providing value before monetizing
5. **User Feedback**: Listen to complaints about ads
6. **Seasonal Offers**: Run promotions during holidays
7. **Family Plans**: Consider offering family subscription tiers
8. **Lifetime Option**: Some users prefer one-time purchase

---

**Remember**: The goal is to monetize while keeping users happy! 😊

