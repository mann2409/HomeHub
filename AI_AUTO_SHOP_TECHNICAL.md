# AI Auto Shop - Technical Implementation Guide

## Architecture Overview

The AI Auto Shop feature consists of three main components:

```
┌─────────────────────────────────────────────────────┐
│                 ShoppingList Component               │
│  - User Interface                                    │
│  - Auto Shop Button                                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Opens Modal
                   ▼
┌─────────────────────────────────────────────────────┐
│          AutomatedShoppingScreen                     │
│  - WebView Container                                 │
│  - Control Panel UI                                  │
│  - Progress Tracking                                 │
│  - JavaScript Injection                              │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Uses
                   ▼
┌─────────────────────────────────────────────────────┐
│       retailerAutomationService                      │
│  - Browser Automation Logic                          │
│  - Retailer-Specific Selectors                       │
│  - AI Integration (Claude)                           │
└─────────────────────────────────────────────────────┘
```

## Core Components

### 1. AutomatedShoppingScreen.tsx

**Purpose**: Main UI component that hosts the WebView and automation controls.

**Key Features**:
- WebView integration with JavaScript injection
- Real-time progress tracking
- Activity logging
- User controls (pause/resume/stop)

**State Management**:
```typescript
const [isAutomating, setIsAutomating] = useState(false);
const [isPaused, setIsPaused] = useState(false);
const [currentStep, setCurrentStep] = useState<AutomationStep | null>(null);
const [completedItems, setCompletedItems] = useState<string[]>([]);
const [failedItems, setFailedItems] = useState<string[]>([]);
const [logs, setLogs] = useState<string[]>([]);
```

**Key Methods**:
- `executeJavaScript()`: Injects and executes JS in WebView
- `startAutomation()`: Initiates the automation flow
- `pauseAutomation()`: Pauses the automation
- `resumeAutomation()`: Resumes from pause
- `stopAutomation()`: Stops completely

### 2. retailerAutomationService.ts

**Purpose**: Core automation logic and retailer-specific implementations.

**Exports**:
```typescript
export function automateRetailerShopping(options: AutomationOptions): Promise<void>
export function getAIShoppingAssistance(retailer, items, pageHTML): Promise<string>
```

**Retailer Selectors**:
```typescript
const SELECTORS = {
  woolworths: {
    searchInput: 'input[type="search"]',
    searchButton: 'button[type="submit"]',
    productCard: '.product-tile',
    addToCartButton: 'button[aria-label*="Add"]',
    cartIcon: 'a[href*="cart"]',
    // ...
  },
  coles: {
    // Similar structure
  }
};
```

## JavaScript Injection Strategy

### How It Works

The automation uses `WebView.injectJavaScript()` to run code in the browser context:

```typescript
webViewRef.current.injectJavaScript(`
  (async function() {
    // Your code here
    const searchBox = document.querySelector('input[type="search"]');
    searchBox.value = 'Milk';
    searchBox.dispatchEvent(new Event('input', { bubbles: true }));
  })();
  true; // Required to avoid warnings
`);
```

### Communication: WebView ↔ React Native

**From WebView to React Native**:
```typescript
// In injected JavaScript:
window.ReactNativeWebView.postMessage(JSON.stringify({ 
  success: true, 
  result: data 
}));

// In React Native:
const handleWebViewMessage = (event: WebViewMessageEvent) => {
  const data = JSON.parse(event.nativeEvent.data);
  // Handle data
};
```

### Helper Functions

#### waitForElement
Polls for an element until found or timeout:
```typescript
const waitForElement = (selector: string, timeout: number = 5000): string => {
  return `
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const element = document.querySelector('${selector}');
        if (element) {
          clearInterval(interval);
          resolve(true);
        } else if (Date.now() - startTime > ${timeout}) {
          clearInterval(interval);
          reject(new Error('Element not found'));
        }
      }, 100);
    });
  `;
};
```

#### clickElement
Safely clicks an element with scrolling:
```typescript
const clickElement = (selector: string): string => {
  return `
    const element = document.querySelector('${selector}');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(resolve => setTimeout(resolve, 500));
      element.click();
      return true;
    }
    return false;
  `;
};
```

#### typeText
Simulates realistic typing:
```typescript
const typeText = (selector: string, text: string): string => {
  return `
    const element = document.querySelector('${selector}');
    if (element) {
      element.focus();
      element.value = '';
      
      const text = '${text.replace(/'/g, "\\'")}';
      for (let i = 0; i < text.length; i++) {
        element.value += text[i];
        element.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  `;
};
```

## Automation Flow

### Main Automation Sequence

```
1. Initialize
   ├─ Load retailer website
   └─ Wait for page load (3s)

2. Check Authentication
   ├─ Look for "Sign In" button
   ├─ If not signed in: Pause for manual auth
   └─ Wait for auth completion

3. Process Each Item
   ├─ Clear search box
   ├─ Type item name
   ├─ Submit search
   ├─ Wait for results (3s)
   ├─ Find first product
   ├─ Click "Add to Cart"
   ├─ Wait for confirmation (1.5s)
   └─ Log success/failure

4. Navigate to Cart
   ├─ Find cart icon
   ├─ Click cart
   └─ Wait for cart page

5. Complete
   └─ Show success message
```

### Code Example

```typescript
// Main automation loop
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  
  // Step 1: Search
  await executeScript(typeText(selectors.searchInput, item.name));
  await sleep(800);
  
  // Step 2: Submit
  await executeScript(clickElement(selectors.searchButton));
  await sleep(3000);
  
  // Step 3: Add to cart
  const result = await executeScript(addFirstProductToCart(retailer));
  
  if (result?.success) {
    onItemCompleted?.(item.id, true);
  } else {
    onItemCompleted?.(item.id, false);
  }
  
  await sleep(1500);
}
```

## AI Integration

### Using Claude for Smart Assistance

The system can use Claude AI to analyze page structure and provide guidance:

```typescript
import { getAnthropicClient } from '../api/anthropic';

export async function getAIShoppingAssistance(
  retailer: RetailerType,
  items: ShoppingItem[],
  currentPageHTML: string
): Promise<string> {
  const client = getAnthropicClient();
  
  const prompt = `You are a shopping assistant for ${retailer}.
  
  Shopping list: ${items.map(i => i.name).join(', ')}
  Page content: ${currentPageHTML.substring(0, 1000)}
  
  What should I do next?`;
  
  const message = await client.messages.create({
    model: 'claude-3-5-haiku-latest',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });
  
  return message.content[0].text;
}
```

### When to Use AI

Currently, AI is available but not actively used in the main flow. Potential uses:

1. **Fallback when selectors fail**: If standard selectors don't work, ask AI to analyze the page
2. **Product selection**: AI could choose the best matching product
3. **Error recovery**: AI could suggest alternative approaches
4. **Adaptive selectors**: Learn and adapt to site changes

## Retailer-Specific Implementation

### Adding a New Retailer

To add support for a new retailer:

1. **Add to RetailerType**:
```typescript
export type RetailerType = 'woolworths' | 'coles' | 'iga'; // Add new
```

2. **Add Selectors**:
```typescript
const SELECTORS = {
  // ... existing
  iga: {
    searchInput: 'input#search',
    searchButton: 'button.search-btn',
    productCard: '.product',
    addToCartButton: 'button.add-cart',
    cartIcon: 'a.cart-link',
  }
};
```

3. **Test Thoroughly**:
- Test authentication flow
- Test search functionality
- Test add to cart
- Test cart navigation

### Woolworths Specifics

**Base URL**: `https://www.woolworths.com.au`

**Key Selectors**:
- Search: `input[type="search"]`
- Products: `.product-tile`
- Add button: `button[aria-label*="Add"]`

**Notes**:
- Requires authentication for most actions
- Uses AJAX for cart updates
- Product cards have consistent structure

### Coles Specifics

**Base URL**: `https://www.coles.com.au`

**Key Selectors**:
- Search: `input[aria-label*="Search"]`
- Products: `.product`
- Add button: `button:contains("Add to trolley")`

**Notes**:
- Uses "trolley" instead of "cart"
- May have regional product variations
- Guest checkout available

## Error Handling

### Types of Errors

1. **Network Errors**: Connection issues
2. **Selector Errors**: Element not found
3. **Timing Errors**: Page not loaded
4. **Authentication Errors**: Not signed in
5. **Product Errors**: Item not found

### Error Recovery Strategy

```typescript
try {
  await executeScript(clickElement(selector));
} catch (error) {
  // Log the error
  addLog(`❌ Error: ${error.message}`);
  
  // Try alternative selector
  await executeScript(clickElement(alternativeSelector));
  
  // If all fails, mark item as failed
  onItemCompleted?.(item.id, false);
}
```

### Timeout Handling

All operations have timeouts to prevent infinite waiting:

```typescript
const TIMEOUTS = {
  pageLoad: 5000,      // 5s for page load
  elementWait: 3000,   // 3s to find element
  searchResults: 4000, // 4s for search results
  cartAdd: 2000,       // 2s for cart confirmation
};
```

## Performance Optimization

### Minimize Delays

Use appropriate delays between actions:
- **Search input**: 800ms (allow typing animation)
- **Search results**: 3000ms (wait for AJAX)
- **Cart add**: 1500ms (wait for confirmation)
- **Between items**: 1500ms (prevent rate limiting)

### Batch Operations

Where possible, batch operations:
```typescript
// Bad: Sequential searches
for (item of items) {
  await search(item);
  await add();
}

// Better: Could preload search results (future enhancement)
```

## Testing

### Manual Testing Checklist

- [ ] Empty shopping list handling
- [ ] Single item automation
- [ ] Multiple items automation
- [ ] Authentication pause/resume
- [ ] Out of stock items
- [ ] Network interruption
- [ ] Pause/Resume controls
- [ ] Stop functionality
- [ ] Activity log accuracy

### Unit Test Examples

```typescript
describe('retailerAutomationService', () => {
  it('should build correct search URL for Woolworths', () => {
    const url = buildRetailerSearchUrl('woolworths', 'Milk');
    expect(url).toContain('woolworths.com.au');
    expect(url).toContain('searchTerm=Milk');
  });
  
  it('should handle item name with special characters', () => {
    const script = typeText('input', "O'Brien's Bread");
    expect(script).not.toThrow();
  });
});
```

## Security Considerations

### What We Do

✅ **Secure Practices**:
- No credential storage
- Manual authentication only
- Local processing only
- No external API calls with personal data
- User reviews cart before purchase

### What to Avoid

❌ **Never**:
- Store login credentials
- Auto-submit payment forms
- Access payment information
- Track user purchases
- Share data with third parties

### Rate Limiting

To avoid being flagged as a bot:
- Reasonable delays between actions (1-3s)
- Realistic typing speed (50ms per character)
- Human-like scrolling behavior
- Respect robots.txt (if applicable)

## Configuration

### Environment Variables

```env
# Required for AI features
EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY=sk-ant-...

# Optional: Custom timeouts (ms)
AUTO_SHOP_PAGE_LOAD_TIMEOUT=5000
AUTO_SHOP_SEARCH_TIMEOUT=4000
AUTO_SHOP_ITEM_DELAY=1500
```

### Feature Flags

Future: Add feature flags for gradual rollout:
```typescript
const FEATURE_FLAGS = {
  autoShopEnabled: true,
  aiAssistanceEnabled: true,
  multiRetailerCompare: false, // Coming soon
};
```

## Monitoring & Analytics

### Metrics to Track

- Automation success rate
- Average time per item
- Most common failures
- Retailer reliability
- User satisfaction

### Logging

Structured logging format:
```typescript
console.log('[AutoShop]', {
  action: 'item_added',
  retailer: 'woolworths',
  itemName: 'Milk',
  success: true,
  duration: 4200, // ms
  timestamp: Date.now(),
});
```

## Future Enhancements

### Short Term
1. **Improved Product Matching**: Use AI to select best match
2. **Variant Selection**: Handle size/flavor options
3. **Price Comparison**: Show prices before adding

### Medium Term
1. **Multi-Retailer**: Compare prices across retailers
2. **Smart Substitutions**: Suggest alternatives for out-of-stock
3. **Scheduled Shopping**: Run automation on schedule

### Long Term
1. **Computer Use API**: Use Anthropic's Computer Use for more robust automation
2. **Voice Control**: "Add milk to my Woolworths cart"
3. **ML-based Selector Discovery**: Auto-adapt to site changes

## Troubleshooting Guide

### Common Issues

**Issue**: WebView not loading
```typescript
// Check internet connection
// Verify retailer URL is correct
// Check WebView permissions in AndroidManifest.xml
```

**Issue**: JavaScript not executing
```typescript
// Ensure javaScriptEnabled={true}
// Check for console errors in WebView
// Verify script syntax (must end with 'true;')
```

**Issue**: Selectors not working
```typescript
// Website may have changed
// Use browser DevTools to find new selectors
// Update SELECTORS object
```

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Add JSDoc comments for public functions
- Keep functions small and focused

### Pull Request Checklist

- [ ] Code follows style guide
- [ ] Added/updated tests
- [ ] Updated documentation
- [ ] Tested on both iOS and Android
- [ ] Tested with both retailers
- [ ] No console warnings/errors

## Resources

- [React Native WebView Docs](https://github.com/react-native-webview/react-native-webview)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Woolworths Website](https://www.woolworths.com.au)
- [Coles Website](https://www.coles.com.au)

---

**Version**: 1.0.0  
**Maintainer**: Development Team  
**Last Updated**: October 2025

