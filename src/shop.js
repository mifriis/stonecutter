export const shopItems = [
    {
      id: 'gen1',
      name: 'Cobblestone Generator',
      description: '+1 count/sec',
      cost: 5,
      effect: (setCount) => {
        return setInterval(() => setCount(c => c + 1), 1000);
      }
    },
    // More items can be added here
  ];
  