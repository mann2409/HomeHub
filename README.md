# HomeBoard - Centralized Home Management Dashboard

A clean, minimalist React Native app for managing home tasks, calendar, meals, finances, and shopping with a modular card-based design optimized for iOS.

## Features

### 🏠 **Dashboard Overview**
- **Modular Design**: Card-based layout with clean UI and minimalist aesthetic
- **Responsive Layout**: Vertically scrollable main dashboard with good spacing
- **Real-time Updates**: Live date/time display and weather information

### 🌤️ **Header Section**
- **Weather Widget**: Current temperature and conditions (top-right)
- **Date & Time Display**: Live updating date and time (top-left)
- **User Profile**: Avatar with settings access (top-right)

### 📅 **Calendar & Tasks**
- **7-Day Calendar**: Horizontal scrollable calendar with week navigation
- **Task Management**: Today's tasks/events with color-coded categories
- **Quick Add**: Easy task creation with priority levels and categories
- **Task Tracking**: Complete/incomplete status with visual indicators

### 🍽️ **Weekly Meal Planner**
- **7x3 Grid**: Breakfast, lunch, dinner for 7 days
- **Meal Categories**: Healthy, quick, comfort, vegetarian, vegan, protein
- **Easy Management**: Add/edit meals with ingredients and prep time
- **Visual Planning**: Color-coded meal categories

### 💰 **Finance Tracker**
- **Weekly Overview**: Total spending with visual breakdown
- **Pie Chart**: Category-wise spending visualization
- **Bar Chart**: Daily spending trends for last 7 days
- **Quick Add**: Fast expense entry with auto-categorization
- **Smart Analytics**: Daily averages and spending insights

### 🛒 **Shopping List**
- **Auto-Categorization**: Smart item categorization (produce, dairy, meat, etc.)
- **Cost Estimation**: Running total with estimated prices
- **Priority System**: High/medium/low priority items
- **Progress Tracking**: Completed vs pending items
- **Category Organization**: Grouped by shopping categories

### ⚡ **Quick Access Widgets**
- **2x2 Grid**: Customizable widget layout
- **Quick Actions**: Add Task, Add Expense, Shopping Item, Quick Note
- **One-Tap Access**: Instant access to frequently used functions

### 🎨 **Design System**
- **Color Palette**: Soft neutrals with category accent colors
- **Typography**: Clear, readable fonts with good contrast
- **Animations**: Smooth transitions using react-native-reanimated
- **Cards**: Rounded corners with subtle shadow effects
- **Spacing**: Ample white space following 8px grid system

### ⚙️ **Customization**
- **Theme Options**: Light/dark/system theme selection
- **Module Visibility**: Show/hide dashboard modules
- **Notifications**: Granular notification controls
- **Category Colors**: Customizable color schemes

## Tech Stack

- **Framework**: React Native 0.79.2 with Expo SDK 53
- **Navigation**: @react-navigation/bottom-tabs, @react-navigation/native-stack
- **State Management**: Zustand with AsyncStorage persistence
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Charts**: Victory Native for data visualization
- **Animations**: react-native-reanimated v3
- **Gestures**: react-native-gesture-handler
- **Icons**: @expo/vector-icons (Ionicons)
- **Date Handling**: date-fns
- **Lists**: @shopify/flash-list for performance

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn/bun
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Getting Started

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Start Development Server**
   ```bash
   bun start
   ```

3. **Run on Device/Simulator**
   ```bash
   # iOS
   bun ios
   
   # Android
   bun android
   ```

### Weather API Setup (Optional)

The app includes mock weather data by default. To use real weather data:

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Update the API key in `src/services/weatherService.ts`:
   ```typescript
   const OPENWEATHER_API_KEY = "your_api_key_here";
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Card.tsx        # Base card component
│   ├── Button.tsx      # Button component
│   ├── Modal.tsx       # Modal component
│   ├── Input.tsx       # Input component
│   └── ...
├── screens/            # Main app screens
│   ├── DashboardScreen.tsx
│   ├── CalendarScreen.tsx
│   ├── MealsScreen.tsx
│   ├── FinanceScreen.tsx
│   └── ShoppingScreen.tsx
├── state/              # Zustand stores
│   ├── taskStore.ts    # Task management
│   ├── mealStore.ts    # Meal planning
│   ├── financeStore.ts # Expense tracking
│   ├── shoppingStore.ts # Shopping list
│   ├── settingsStore.ts # App settings
│   └── weatherStore.ts # Weather data
├── services/           # External services
│   └── weatherService.ts
├── types/              # TypeScript interfaces
│   └── index.ts
├── utils/              # Utility functions
│   └── cn.ts          # Tailwind class merger
└── navigation/         # Navigation setup
    └── AppNavigator.tsx
```

## Key Features Implementation

### State Management
- **Zustand Stores**: Separate stores for each feature domain
- **Persistence**: AsyncStorage integration for data persistence
- **Type Safety**: Full TypeScript support with proper interfaces

### Data Models
- **Tasks**: Title, description, category, priority, due date
- **Meals**: Name, type, category, ingredients, prep time
- **Expenses**: Amount, category, payment method, date
- **Shopping Items**: Name, quantity, category, estimated price

### Auto-Categorization
- **Smart Categorization**: Automatic item categorization based on keywords
- **Learning System**: Improves suggestions based on user patterns
- **Manual Override**: Users can manually adjust categories

### Charts & Visualization
- **Pie Charts**: Category spending breakdown
- **Bar Charts**: Daily spending trends
- **Progress Indicators**: Task completion, shopping progress

## Customization Options

### Theme Customization
- Light/Dark/System theme modes
- Custom color schemes for categories
- Consistent design tokens

### Module Configuration
- Show/hide dashboard modules
- Reorder module priority
- Customize quick access widgets

### Data Export/Import
- Local data persistence
- Settings backup/restore
- Data migration support

## Performance Optimizations

- **FlashList**: High-performance lists for large datasets
- **Reanimated**: 60fps animations on low-end devices
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Optimized re-renders with React.memo
- **State Selectors**: Granular state subscriptions

## Accessibility

- **Screen Reader**: Full VoiceOver/TalkBack support
- **High Contrast**: Accessible color combinations
- **Touch Targets**: Minimum 44px touch targets
- **Focus Management**: Proper keyboard navigation

## Future Enhancements

- **Cloud Sync**: Cross-device synchronization
- **Widgets**: iOS/Android home screen widgets
- **Notifications**: Smart reminders and alerts
- **Integrations**: Calendar sync, banking APIs
- **AI Features**: Smart meal suggestions, budget insights
- **Collaboration**: Family sharing and collaboration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

---

**HomeBoard** - Your centralized home management solution 🏠✨