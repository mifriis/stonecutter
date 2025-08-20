// Calculate efficiency based on number of generators
const calculateEfficiency = (count) => {
  // Less aggressive diminishing returns
  return 1 / (1 + Math.log(count + 1) * 0.2);
};

export const shopItems = [
  {
    id: 'gen1',
    name: 'Cobblestone Generator',
    description: '+1 count/sec (affected by diminishing returns)',
    cost: 5,
    revealFraction: 0.6,
    productionAmount: 1,
    effect: ({ enqueueDelta, stone }) => {
      // Start production interval
      return setInterval(() => {
        // Calculate total production for all owned generators
        const ownedCount = purchased['gen1'] || 0;
        if (ownedCount > 0) {  // Only calculate if we have generators
          const efficiency = calculateEfficiency(ownedCount);
          const production = ownedCount * efficiency;
          // Round to nearest whole stone and queue it with immediate processing
          const wholeStones = Math.round(production);
          enqueueDelta(wholeStones, true);  // Process immediately for predictable generation
        }
      }, 1000);
    },
  },
  {
    id: 'cart',
    name: 'Cart',
    description: 'Hauls 1 stone/sec to the stall',
    cost: 20,
    revealFraction: 0.5,
    effect: ({ enqueueDelta, setStallStones, stone }) => {
      // Cart effect implementation
      return setInterval(() => {
        const ownedCount = purchased['cart'] || 0;
        if (ownedCount > 0) {
          // Take whatever stones are available, up to cart capacity
          const stonesToMove = Math.min(ownedCount, stone.getCount());
          if (stonesToMove > 0) {
            enqueueDelta(-stonesToMove, true);  // Process immediately for predictable transport
            setStallStones(s => s + stonesToMove);
          }
        }
      }, 1000);
    },
  }
];

let purchased = {};

export function getState() {
  return { purchased };
}

export function setState(state) {
  purchased = state?.purchased || {};
}

export function purchaseItem(id) {
  purchased[id] = true;
}