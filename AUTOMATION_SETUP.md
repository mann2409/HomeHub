# 🎯 Automation System for Automated Shopping

## Overview

This automation system allows you to:
1. **Record** your manual shopping actions (taps, clicks, inputs)
2. **Save** the recorded sequence as an automation script
3. **Replay** the script with different products automatically

## How It Works

### 1. Recording Phase

When you tap "Set Up Automation" for a retailer:
- Opens a WebView with the retailer's website (Woolworths or Coles)
- Click "Start Recording"
- Perform the manual actions:
  - Tap the search box
  - Enter a test product name (e.g., "milk")
  - Tap search
  - Tap on the first result
  - Tap "Add to Cart"
- Click "Stop Recording"
- Save the automation script

### 2. Playback Phase

When you want to auto-shop:
- Select items from your shopping list
- The automation will:
  - Open the retailer's website in the WebView
  - Replay your recorded tap sequence
  - Substitute the product name dynamically
  - Execute the actions automatically

## Components Created

### 1. `AutomationRecorder.tsx`
- Instructions modal for setting up automation
- Guides user through the recording process
- Manages the automation creation flow

### 2. `AutomationWebView.tsx`
- Embeddes the retailer's website
- Injects JavaScript to capture all user interactions
- Records tap coordinates (x, y) and action types
- Real-time feedback of recorded actions

### 3. `automation.ts` (types)
- Type definitions for automation scripts
- RecordingAction: individual action with coordinates
- AutomationScript: complete script with metadata

## Integration Needed

You'll need to integrate these components into your shopping screen:

```typescript
// In AutomatedShoppingScreen or ShoppingList component
const [showAutomationRecorder, setShowAutomationRecorder] = useState(false);
const [automationScript, setAutomationScript] = useState<AutomationScript | null>(null);

// When user wants to set up automation
<Pressable onPress={() => setShowAutomationRecorder(true)}>
  <Text>Set Up Automation</Text>
</Pressable>

<AutomationWebView
  visible={showAutomationRecorder}
  onClose={() => setShowAutomationRecorder(false)}
  onRecorded={(actions) => {
    // Save automation script
    const script: AutomationScript = {
      id: Date.now().toString(),
      retailer: 'woolworths', // or 'coles'
      name: 'Woolworths Shopping Automation',
      actions: actions,
      createdAt: Date.now()
    };
    setAutomationScript(script);
    // Save to AsyncStorage
  }}
  retailer="woolworths"
  url="https://www.woolworths.com.au"
/>
```

## Next Steps

1. **Add playback capability**: Create component to replay the saved automation
2. **Product name substitution**: Find the input action and replace with dynamic product name
3. **Error handling**: Handle website changes, element not found, etc.
4. **Retry logic**: If an action fails, retry or skip
5. **Progress feedback**: Show progress bar during automation playback

## Technical Details

### Recording Coordinates
- Uses browser's `click` and `input` events
- Captures `clientX` and `clientY` relative to viewport
- Stores timestamp for timing delay between actions

### Playback
- Injects JavaScript to programmatically trigger clicks at recorded coordinates
- Uses `document.elementFromPoint(x, y)` to find element
- Calls `element.click()` or `element.focus()` for inputs

### Challenges to Handle
- Website layout changes (element positions shift)
- Dynamic content loading (wait for elements)
- Multiple possible product results (take first or closest match)
- Login/session management

## Security & Limitations

⚠️ **Note**: This automation:
- Requires user to manually perform actions first
- Won't work if website structure changes significantly
- May violate some websites' terms of service
- Should only be used for personal shopping

Consider implementing:
- Automatic re-recording if automation fails
- Periodic script updates
- Fallback to manual mode
