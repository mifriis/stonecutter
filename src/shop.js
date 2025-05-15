export const shopItems = [
  {
    id: 'gen1',
    name: 'Cobblestone Generator',
    description: '+1 count/sec',
    cost: 5,
    revealFraction: 0.6,
    effect: ({ setCount }) => {
      return setInterval(() => setCount(c => c + 1), 1000);
    },
  },
  {
    id: 'cart',
    name: 'Cart',
    description: 'Hauls 1 stone/sec to the stall',
    cost: 20,
    revealFraction: 0.5,
    effect: ({ setCount, setStallStones }) => {
      return setInterval(() => {
        setCount(c => {
          if (c <= 0) return c;
    
          // Queue both state updates outside the updater function to avoid nested calls
          setStallStones(s => s + 1);
          return c - 1;
        });
      }, 1000);
    },    
  },
  // Add more items here as needed
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