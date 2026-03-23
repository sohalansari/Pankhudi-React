# Fix Category Page & Database Error

## Current Task Progress

### ✅ 1. Create TODO.md - [COMPLETED]

### ⏳ 2. Create `product_images` table migration
- Add CREATE TABLE to backend/sql/PankhudiMain.sql
- Migrate DB if needed

### ⏳ 3. Clean up backend/routes/categories.js
- Remove duplicate products.js code at end
- Keep only category/subcategory routes
- Fix any image queries to use new table

### ⏳ 4. Verify /api/products endpoint supports all filters
- Price range, brand, stock, sale, sorting by discount/rating/etc.

### ⏳ 5. Restart backend server
- cd backend && node server.js

### ⏳ 6. Test category page features
- Filters, sorting, discount display
- Navigate to /category/[id]

### ⏳ 7. attempt_completion

**Next Step:** Create product_images table
