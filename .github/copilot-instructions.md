# Stonecutter - Cop2. Intervals and Effects
1. Use ONE interval per game mechanic type:
   - One interval for all generators
   - One interval for all carts
   - One interval for market updates
2. NEVER create multiple intervals for the same mechanic (e.g., one per cart)
3. Calculate total effect in the interval (e.g., total cart capacity) rather than running multiple effects
4. When handling automated effects that generate resources:
   - Use `enqueueDelta(amount, true)` for immediate processing to avoid race conditions with the queue interval
   - This ensures predictable resource generation and easier testing
   - The main queue interval should only be used for batching manual actions and complex mechanics
5. Timing considerations:
   - The main queue processes every 1000ms
   - Generator/cart intervals also run every 1000ms
   - Use immediate processing for generators to avoid race conditions between enqueueing and processing
   - For testing intervals, remember that effects may need an extra tick to process all changesstructions

## Project Overview
Stonecutter is a React-based idle game where players generate and sell stones. The game features generators, transport mechanics, and a market system with dynamic pricing.

### Tech Stack
- React (Vite)
- JavaScript/JSX
- Tailwind CSS for styling

## Key Architecture Principles

### State Management
1. All stone count modifications MUST go through the queue system in `stone.js`
2. Two types of updates exist:
   - Manual (user clicks) - processed immediately but still through queue
   - Automated (generators/carts) - processed on interval
3. Never modify stone count directly; always use `enqueueDelta(amount, isManual)`

### Intervals and Effects
1. Use ONE interval per game mechanic type:
   - One interval for all generators
   - One interval for all carts
   - One interval for market updates
2. NEVER create multiple intervals for the same mechanic (e.g., one per cart)
3. Calculate total effect in the interval (e.g., total cart capacity) rather than running multiple effects

### Game Mechanics
1. **Generators**:
   - Use diminishing returns formula: `1 / (1 + Math.log(count + 1) * 0.2)`
   - Calculate total production based on owned count × efficiency
2. **Carts**:
   - Linear scaling (no diminishing returns)
   - Treat multiple carts as one cart with increased capacity
3. **Market**:
   - Handles automatic stone sales
   - Updates prices based on demand

## Project Structure
```
src/
  ├── stone.js       # Core stone generation and queue system
  ├── shop.js        # Shop items and their effects
  ├── market.js      # Market price and demand mechanics
  ├── storage.js     # Save/load game state
  └── Stonecutter.jsx # Main game component
```

## Development Guidelines

### Making Changes
1. All state updates should be queued:
   ```javascript
   // Correct
   enqueueDelta(amount, isManual);
   
   // Incorrect
   setCount(count + amount);
   ```

2. Interval Management:
   ```javascript
   // Correct - one interval handling all instances
   effect: () => {
     return setInterval(() => {
       const totalCapacity = purchased[id] || 0;
       handleEffect(totalCapacity);
     }, 1000);
   }
   
   // Incorrect - creating multiple intervals
   effect: () => {
     for (let i = 0; i < count; i++) {
       setInterval(() => handleEffect(), 1000);
     }
   }
   ```

### Build and Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Access the game at http://localhost:5173

## Common Pitfalls
1. Don't modify state outside the queue system
2. Don't create multiple intervals for the same mechanic
3. Always clean up intervals in useEffect returns
4. Remember to handle edge cases (negative stones, zero generators, etc.)
5. Watch for timing race conditions:
   - Resource generation intervals and queue processing can compete
   - Use `enqueueDelta(amount, true)` for predictable automated generation
   - Queue batching (processNow=false) should be used for manual actions or when order isn't critical
6. Testing interval-based mechanics:
   - Account for both the effect interval and queue processing interval
   - Be explicit about timing expectations in test descriptions
   - Use immediate processing when testing automated generation to avoid flaky tests

## Testing Changes
1. Test manual actions (clicks)
2. Test automated generation
3. Verify production stats update correctly
4. Check save/load functionality
5. Verify reset progress works
