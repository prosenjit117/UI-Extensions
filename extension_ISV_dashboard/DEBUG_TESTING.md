# 🐛 Debug Testing Guide - Developer Dashboard Extension

## Quick Start for Debug Testing

### Step 1: Install Dependencies (if not already done)

```bash
cd /Users/prosenjit.banerjee/Documents/ATT_Theme/extensions/developer_dashboard_extension
npm install
```

### Step 2: Start the Development Server

```bash
npm run start
```

**Expected Output:**
```
webpack compiled successfully
ℹ ｢wds｣: Project is running at http://localhost:8080/
ℹ ｢wds｣: webpack output is served from /
```

**Important:** The webpack server logs will show query parameters you need to add to access the extension in your AppDirect marketplace.

### Step 3: Access the Extension

The extension can be accessed in your AppDirect marketplace environment. You'll need to:

1. **Add query parameters** (shown in webpack logs when you run `npm run start`)
2. **Navigate to the extension URL** in your browser
3. The extension will load at: `http://localhost:8080/` (or the port shown in logs)

## 🔍 Testing the Pricing Feature

### What to Test

1. **Product Details Page**
   - Navigate to a product detail page
   - Verify pricing information displays correctly for each edition
   - Check that edition codes are shown
   - Verify pricing formats correctly (e.g., "USD 10.00" or "USD 10.00 - USD 140.00")

2. **Pricing Display**
   - Single price: Should show "USD X.XX"
   - Multiple prices: Should show range "USD X.XX - USD Y.YY"
   - No pricing: Should show "Price on request"
   - Empty itemPrices: Should show "Price on request"

### Steps to Test Pricing

1. **Start the dev server:**
   ```bash
   npm run start
   ```

2. **Open your browser DevTools (F12)**

3. **Navigate to a Product Detail page:**
   - From the dashboard, click on a product
   - Or directly navigate to: `/products/{productId}`

4. **Check the "Editions & Pricing" section:**
   - Should display a table with:
     - Edition Code
     - Edition Name
     - Pricing (formatted)

5. **Verify in Browser Console (F12):**
   - Open Console tab
   - Check for any GraphQL errors
   - Look for successful API calls
   - Verify pricing data is being fetched correctly

6. **Check Network Tab:**
   - Open Network tab
   - Filter by "graphql" or "preview"
   - Click on the GraphQL request
   - Verify the query includes pricing structure:
     ```graphql
     pricing {
       pricingPlans {
         costs {
           itemPrices {
             prices {
               amount
               currency
             }
           }
         }
       }
     }
     ```
   - Check the response includes pricing data

## 📊 Debugging Checklist

### ✅ Visual Checks

- [ ] Product details page loads without errors
- [ ] "Editions & Pricing" section appears
- [ ] Table shows Edition Code, Edition Name, and Pricing columns
- [ ] Prices are formatted correctly (currency + amount)
- [ ] "Price on request" shows for editions without pricing

### ✅ Console Checks

- [ ] No red errors in browser console
- [ ] GraphQL queries execute successfully
- [ ] No 404 errors for API endpoints
- [ ] Pricing data appears in network responses

### ✅ Data Verification

- [ ] Pricing structure matches expected format:
  ```
  pricing.pricingPlans[].costs[].itemPrices[].prices[]
  ```
- [ ] Edition codes display correctly
- [ ] Edition names display correctly
- [ ] Multiple prices show as ranges
- [ ] Empty pricing shows "Price on request"

## 🐛 Common Issues & Solutions

### Issue: Pricing not showing

**Possible causes:**
1. GraphQL query doesn't include pricing fields
2. Pricing structure doesn't match API response
3. Edition doesn't have pricing data

**Debug steps:**
1. Check Network tab → GraphQL request → Response
2. Verify pricing data exists in response
3. Check browser console for errors
4. Verify `formatPricing()` function logic

### Issue: "N/A" or "Price on request" for all editions

**Possible causes:**
1. `itemPrices` array is empty
2. `prices` array is empty
3. `amount` is null or undefined

**Debug steps:**
1. Check GraphQL response in Network tab
2. Look at raw pricing data structure
3. Verify pricing data extraction logic

### Issue: GraphQL query errors

**Possible causes:**
1. Schema mismatch
2. Missing required fields
3. Invalid query structure

**Debug steps:**
1. Check browser console for GraphQL errors
2. Verify query structure matches API schema
3. Test query in GraphQL playground if available

## 🔧 Debug Tools

### Browser DevTools

**Console:**
- Shows JavaScript errors
- Logs GraphQL query errors
- Displays runtime warnings

**Network Tab:**
- Shows all API requests
- Filter by "graphql" to see queries
- Inspect request/response payloads
- Check response status codes

**Application/Storage:**
- Check localStorage/sessionStorage
- Verify cookies are set
- Inspect service worker (if any)

### React DevTools

If React DevTools extension is installed:
1. Inspect component props
2. Check component state
3. Verify data flow
4. Profile performance

### GraphQL Testing

If you have access to GraphQL playground:
1. Test queries directly
2. Verify schema structure
3. Test with sample data
4. Validate response format

## 📝 Testing Specific Scenarios

### Test Case 1: Product with Single Price Edition
- Expected: Shows "USD 10.00"
- Action: Navigate to product with edition having one price

### Test Case 2: Product with Multiple Prices
- Expected: Shows "USD 10.00 - USD 140.00"
- Action: Navigate to product with edition having price range

### Test Case 3: Product with No Pricing
- Expected: Shows "Price on request"
- Action: Navigate to product with edition having empty `itemPrices`

### Test Case 4: Product with Multiple Editions
- Expected: Each edition shows its own pricing
- Action: Navigate to product with multiple editions

## 🚀 Production Build Testing

Before deploying, test the production build:

```bash
# Build for production
npm run build

# hosted from dist folder
```

Verify:
- [ ] Production build completes without errors
- [ ] Extension zip file is created
- [ ] No console errors in production mode
- [ ] Pricing displays correctly in production build

## 📞 Getting Help

If you encounter issues:

1. **Check the logs:**
   - Browser console (F12)
   - Terminal output from `npm run start`
   - Network tab in DevTools

2. **Verify the data:**
   - Check GraphQL response structure
   - Verify pricing data format matches expected structure

3. **Test with sample data:**
   - Use the provided GraphQL response example
   - Compare with actual API response

## 🎯 Quick Commands Reference

```bash
# Start development server
npm run start

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

---

**Ready to test?** Run `npm run start` and open your browser! 🚀
