# AI Auto Shop - Automated Shopping Assistant

## Overview

The AI Auto Shop feature uses AI-powered browser automation to automatically search for items on Woolworths or Coles websites and add them to your cart. This saves you time by automating the repetitive task of searching and adding items one by one.

## Features

- 🤖 **AI-Powered Automation**: Intelligent browser automation that adapts to website changes
- 🔍 **Smart Search**: Automatically searches for each item in your shopping list
- 🛒 **Auto Add to Cart**: Finds and adds products to your cart without manual clicking
- ⏸️ **Pause for Auth**: Automatically pauses when sign-in is required
- 📊 **Real-time Progress**: Track which items have been added successfully
- 🔐 **Secure**: You maintain full control - the app never accesses your credentials

## How to Use

### Step 1: Add Items to Your Shopping List
1. Go to the Dashboard or Shopping screen
2. Add items to your shopping list using the "+" button
3. Add as many items as you need

### Step 2: Launch AI Auto Shop
1. In the Shopping List, look for the **"AI Auto Shop"** section
2. Choose your preferred retailer:
   - 🤖 **Woolworths** - Auto add to cart
   - 🤖 **Coles** - Auto add to cart
3. Tap the button for your chosen retailer

### Step 3: Watch the Automation
The AI will now:
1. ✅ Load the retailer website
2. 🔐 Check if you're signed in
3. 🔍 Search for each item in your list
4. 🛒 Add the first matching product to your cart
5. 📊 Show real-time progress

### Step 4: Sign In (if required)
If you're not signed in:
1. The automation will **pause automatically**
2. You'll see a message: "Sign In Required"
3. Sign in to your account manually
4. Tap **"Resume"** to continue automation

### Step 5: Review and Checkout
After automation completes:
1. The AI navigates to your cart
2. Review all items that were added
3. Remove any incorrect items
4. Proceed to checkout and payment **manually**
5. Complete your purchase securely

## Control Panel

During automation, you have full control:

### Status Display
- **Current Action**: Shows what the AI is currently doing
- **Completed**: Number of items successfully added
- **Failed**: Number of items that couldn't be added
- **Remaining**: Items still to be processed

### Control Buttons
- ⏸️ **Pause**: Temporarily stop automation (you can still browse)
- ▶️ **Resume**: Continue automation after pausing
- 🛑 **Stop**: End automation completely

### Activity Log
- See a real-time log of all actions
- Helpful for debugging if something goes wrong
- Shows timestamps for each action

## How It Works Technically

### Browser Automation
The feature uses WebView with JavaScript injection to:
1. Navigate the website programmatically
2. Find search boxes, buttons, and products
3. Simulate user interactions (typing, clicking)
4. Extract information from the page

### AI Intelligence
Uses Claude AI (Anthropic) to:
- Analyze page structure
- Adapt to website changes
- Provide fallback strategies
- Smart product matching

### Safety Features
1. **Manual Authentication**: You always sign in manually
2. **Manual Payment**: You complete checkout yourself
3. **Pause Anytime**: Stop automation whenever needed
4. **Review Cart**: Always review before purchasing
5. **No Stored Credentials**: Your login info is never saved

## Supported Retailers

### ✅ Woolworths
- Website: https://www.woolworths.com.au
- Full automation support
- Product search and add to cart

### ✅ Coles
- Website: https://www.coles.com.au
- Full automation support
- Product search and add to cart (trolley)

## Tips for Best Results

### 1. Use Clear Item Names
- ✅ Good: "Milk", "Bread", "Bananas"
- ❌ Avoid: "That thing I like", "The usual"

### 2. Add Specific Brands (if needed)
- Example: "Pauls Milk 2L" instead of just "Milk"
- Helps the AI find exactly what you want

### 3. Review Before Checkout
- Always check quantities
- Verify products are correct
- Remove any mistakes

### 4. Good Internet Connection
- Automation requires stable internet
- Avoid switching networks during automation

### 5. Be Patient
- Each item takes 3-5 seconds to process
- Large lists (20+ items) may take several minutes

## Troubleshooting

### Automation Fails to Start
**Problem**: Nothing happens when clicking Auto Shop button  
**Solution**: 
- Check your internet connection
- Make sure you have items in your shopping list
- Try refreshing the app

### Items Not Being Added
**Problem**: Automation runs but items show as "Failed"  
**Solution**:
- Items might be out of stock
- Try more specific product names
- Check if the product exists on that retailer's website

### Sign In Loop
**Problem**: Keeps asking to sign in repeatedly  
**Solution**:
- Clear your browser cookies (Settings > Clear Data)
- Sign in manually first before starting automation
- Make sure "Remember me" is checked when signing in

### Automation Stops Unexpectedly
**Problem**: Automation stops in the middle  
**Solution**:
- Check your internet connection
- The website might have changed - try again later
- Use manual shopping as a fallback

### Wrong Items Added
**Problem**: AI adds incorrect products  
**Solution**:
- Use more specific item names in your list
- Include brand names and sizes
- Remove incorrect items from cart before checkout
- **Always review your cart before paying**

## Limitations

### What It CAN Do
- ✅ Search for products
- ✅ Add products to cart
- ✅ Navigate the website
- ✅ Handle basic site structure

### What It CANNOT Do
- ❌ Sign in automatically (for security)
- ❌ Choose product variants (size, flavor)
- ❌ Compare prices between products
- ❌ Apply coupons or discounts
- ❌ Complete checkout/payment (for security)
- ❌ Handle complex shopping scenarios

## Privacy & Security

### What We Collect
- ❌ **NO** - We do NOT collect your login credentials
- ❌ **NO** - We do NOT store your payment information
- ❌ **NO** - We do NOT track your shopping history
- ✅ **YES** - We only read your shopping list (locally stored)

### How It's Secure
1. **Local Processing**: All automation runs on your device
2. **Manual Auth**: You always sign in yourself
3. **Manual Payment**: You complete checkout yourself
4. **No Data Sharing**: Nothing is sent to external servers
5. **Open Source**: Code is transparent and reviewable

### Retailer Terms of Service
- This automation complies with typical browser usage
- It simulates normal user behavior
- Always follow the retailer's terms of service
- Use responsibly and fairly

## API Configuration

The AI features require an Anthropic API key:

### Setup
1. Get an API key from [Anthropic](https://www.anthropic.com)
2. Add to your `.env` file:
   ```
   EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY=your_key_here
   ```
3. Restart your app

### Cost
- Claude Haiku: ~$0.25 per 1M tokens
- Typical shopping session: ~2,000 tokens
- Cost per session: **< $0.001** (less than a tenth of a cent)

## Feedback & Support

### Report Issues
If you encounter problems:
1. Check the Activity Log for error messages
2. Take a screenshot of the issue
3. Note what item failed and on which retailer
4. Report via the app's feedback feature

### Feature Requests
Want additional retailers or features?
- Email: support@yourdomain.com
- Or submit via the app's settings

## Future Enhancements

Coming soon:
- 🎯 Smart product variant selection (size, flavor)
- 💰 Price comparison between retailers
- 🏷️ Automatic coupon application
- 🔄 Multi-retailer shopping (compare prices)
- 📅 Scheduled automatic shopping
- 🧠 Learning your preferences over time

## Legal Disclaimer

This feature is provided for convenience and time-saving purposes. Users are responsible for:
- Reviewing all cart items before purchase
- Ensuring compliance with retailer terms of service
- Verifying accuracy of orders
- Protecting their own account credentials

The app developers are not responsible for:
- Incorrect items added to cart
- Purchases made without review
- Account security issues
- Retailer policy violations

**Always review your cart before completing any purchase.**

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Supported Retailers**: Woolworths, Coles

