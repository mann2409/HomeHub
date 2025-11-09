# 📱 Ad Implementation Examples

Here are practical examples of how to implement different ad types in your screens.

## 🎯 Banner Ad Examples

### Example 1: Dashboard Screen (Already Implemented!)
```typescript
import BannerAdComponent from "../components/BannerAd";

export default function DashboardScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {/* Your content */}
      </ScrollView>
      
      {/* Banner ad at bottom */}
      <BannerAdComponent />
    </View>
  );
}
```

### Example 2: Calendar Screen
```typescript
import BannerAdComponent from "../components/BannerAd";

export default function CalendarScreen() {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Calendar" />
      
      <ScrollView>
        {/* Calendar content */}
      </ScrollView>
      
      {/* Banner ad */}
      <BannerAdComponent />
    </View>
  );
}
```

### Example 3: Meals Screen
```typescript
import BannerAdComponent from "../components/BannerAd";
import { BannerAdSize } from 'react-native-google-mobile-ads';

export default function MealsScreen() {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Meal Planner" />
      
      {/* Banner ad at top (optional) */}
      <BannerAdComponent size={BannerAdSize.BANNER} />
      
      <ScrollView>
        {/* Meal planning content */}
      </ScrollView>
    </View>
  );
}
```

---

## 💥 Interstitial Ad Examples

### Example 1: After Completing a Task
```typescript
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import useTaskStore from '../state/taskStore';

export default function TaskScreen() {
  const { showAd } = useInterstitialAd();
  const { completeTask } = useTaskStore();
  const [completedCount, setCompletedCount] = useState(0);

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    
    // Show ad every 3 completed tasks
    const newCount = completedCount + 1;
    setCompletedCount(newCount);
    
    if (newCount % 3 === 0) {
      showAd();
    }
  };

  return (
    // Your UI
  );
}
```

### Example 2: Between Screen Transitions
```typescript
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { useNavigation } from '@react-navigation/native';

export default function RecipeSearchScreen() {
  const { showAd, isLoaded } = useInterstitialAd();
  const navigation = useNavigation();
  const [viewCount, setViewCount] = useState(0);

  const handleViewRecipe = (recipe: Recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
    
    // Show ad every 4th recipe view
    const newCount = viewCount + 1;
    setViewCount(newCount);
    
    if (newCount % 4 === 0 && isLoaded) {
      showAd();
    }
  };

  return (
    // Your UI
  );
}
```

### Example 3: After Shopping Trip
```typescript
import { useInterstitialAd } from '../hooks/useInterstitialAd';

export default function ShoppingScreen() {
  const { showAd } = useInterstitialAd();
  const [lastAdTime, setLastAdTime] = useState(0);

  const handleCompleteShoppingTrip = () => {
    // Mark all items as purchased
    completeTrip();
    
    // Show ad, but not more than once every 10 minutes
    const now = Date.now();
    if (now - lastAdTime > 10 * 60 * 1000) {
      showAd();
      setLastAdTime(now);
    }
  };

  return (
    // Your UI with "Complete Trip" button
  );
}
```

---

## 🎁 Rewarded Ad Examples

### Example 1: Unlock Premium Recipe
```typescript
import { useRewardedAd } from '../hooks/useRewardedAd';

export default function RecipeDetailScreen({ route }) {
  const { recipe } = route.params;
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const { showAd, isLoaded } = useRewardedAd((reward) => {
    console.log('User earned reward:', reward);
    setIsUnlocked(true);
    // Save unlock status to storage
    saveRecipeUnlock(recipe.id);
  });

  return (
    <View>
      {recipe.isPremium && !isUnlocked ? (
        <View>
          <Text>This is a premium recipe</Text>
          <TouchableOpacity 
            onPress={showAd}
            disabled={!isLoaded}
          >
            <Text>Watch Ad to Unlock</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {/* Show full recipe */}
        </View>
      )}
    </View>
  );
}
```

### Example 2: Get 24h Premium Access
```typescript
import { useRewardedAd } from '../hooks/useRewardedAd';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [hasTempPremium, setHasTempPremium] = useState(false);
  
  const { showAd, isLoaded } = useRewardedAd(async (reward) => {
    // Give user 24 hours of premium
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
    await AsyncStorage.setItem('tempPremiumExpiry', expiryTime.toString());
    setHasTempPremium(true);
  });

  return (
    <View>
      <Text>Premium Features</Text>
      
      {!hasTempPremium && (
        <TouchableOpacity 
          onPress={showAd}
          disabled={!isLoaded}
          className="bg-purple-600 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">
            Watch Ad for 24h Premium Access
          </Text>
        </TouchableOpacity>
      )}
      
      {hasTempPremium && (
        <Text className="text-green-600">
          ✨ You have premium access for 24 hours!
        </Text>
      )}
    </View>
  );
}
```

### Example 3: Unlock AI Features
```typescript
import { useRewardedAd } from '../hooks/useRewardedAd';

export default function AIChatScreen() {
  const [freeQueries, setFreeQueries] = useState(5);
  
  const { showAd, isLoaded } = useRewardedAd((reward) => {
    // Give user 10 more free AI queries
    setFreeQueries(prev => prev + 10);
  });

  return (
    <View>
      <Text>Free AI Queries Remaining: {freeQueries}</Text>
      
      {freeQueries === 0 && (
        <TouchableOpacity 
          onPress={showAd}
          disabled={!isLoaded}
          className="bg-blue-600 p-4 rounded-lg"
        >
          <Text className="text-white text-center">
            Watch Ad to Get 10 More Queries
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

---

## 🎨 Best Practices

### 1. Ad Frequency
```typescript
// Store ad show count in state
const [adShowCount, setAdShowCount] = useState(0);

// Show ad based on actions
const shouldShowAd = () => {
  return adShowCount % 3 === 0; // Every 3rd action
};

// Or time-based
const [lastAdTime, setLastAdTime] = useState(0);

const shouldShowAdByTime = () => {
  const minutesSinceLastAd = (Date.now() - lastAdTime) / 60000;
  return minutesSinceLastAd >= 5; // Every 5 minutes
};
```

### 2. User Experience First
```typescript
// Show loading state while ad loads
{isLoaded ? (
  <TouchableOpacity onPress={showAd}>
    <Text>Watch Ad</Text>
  </TouchableOpacity>
) : (
  <View>
    <ActivityIndicator />
    <Text>Loading ad...</Text>
  </View>
)}
```

### 3. Premium User Check
```typescript
// All ad components already check for premium status
// But you can also manually check:
const { isPremium } = useSubscriptionStore();

if (isPremium) {
  return <YourContentWithoutAds />;
}

return <YourContentWithAds />;
```

### 4. Error Handling
```typescript
import { useInterstitialAd } from '../hooks/useInterstitialAd';

const { showAd, isLoaded } = useInterstitialAd();

const handleShowAd = () => {
  try {
    if (isLoaded) {
      showAd();
    } else {
      console.log('Ad not ready, continuing without ad');
      // Continue with user's action anyway
      proceedWithAction();
    }
  } catch (error) {
    console.error('Error showing ad:', error);
    // Always let user continue
    proceedWithAction();
  }
};
```

---

## 📊 Recommended Ad Placements

### High Revenue Screens (Banner + Interstitial)
1. **Dashboard** ✅ (Already implemented)
   - Banner at bottom
   - Interstitial every 5 actions

2. **Calendar**
   - Banner at bottom
   - Interstitial when switching months

3. **Meals**
   - Banner at bottom
   - Interstitial after viewing 3 recipes

4. **Shopping List**
   - Banner at bottom
   - Interstitial after completing shopping trip

### Medium Revenue (Banner Only)
- Settings Screen
- Finance Screen
- Recipe Detail Screen

### Rewarded Ads (Optional)
- Unlock premium recipes
- Get temporary premium access
- Unlock special features
- Get extra AI queries

---

## 🚀 Quick Implementation Checklist

1. ✅ Add BannerAdComponent to your screen imports
2. ✅ Place `<BannerAdComponent />` at bottom of your screen
3. ✅ (Optional) Import useInterstitialAd hook
4. ✅ (Optional) Call showAd() at appropriate times
5. ✅ Test in development mode (uses test ads)
6. ✅ Update Ad Unit IDs before production

---

## 💰 Revenue Optimization Tips

### 1. Strategic Placement
- Place banner ads where users spend most time
- Show interstitial ads at natural break points
- Offer rewarded ads as an alternative to subscription

### 2. User Retention
- Don't show ads too frequently
- Always allow users to close ads
- Give option to remove ads via subscription

### 3. Testing
- A/B test different ad frequencies
- Monitor user retention metrics
- Adjust based on user feedback

### 4. Monetization Mix
- 70% Banner ads (consistent, low revenue)
- 20% Interstitial ads (higher revenue, more intrusive)
- 10% Rewarded ads (highest engagement, optional)

---

Good luck with your ad implementation! 🚀

