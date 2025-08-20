import { useState, useEffect } from 'react';
import * as market from './market';
import * as shop from './shop';
import * as storage from './storage';
import * as stone from './stone';

const { resetState } = storage;

export default function Stonecutter() {
  const { count, enqueueDelta, productionRate } = stone.useStone(0);
  const [gold, setGold] = useState(0);
  const [stallStones, setStallStones] = useState(0);
  const [purchased, setPurchased] = useState({});
  const [loaded, setLoaded] = useState(false);
  
 // Load once
useEffect(() => {
  storage.loadState({
    enqueueDelta,
    setGold,
    setStallStones,
    setPurchased,
    market,
    shop,
  });
  setLoaded(true);
}, []);

// Save when changed
useEffect(() => {
  if (!loaded) return;
  storage.saveState({
    count: stone.getCount(),  
    gold,
    stallStones,
    shop: { purchased },
    market: market.getState()
  });
}, [gold, stallStones, purchased, loaded]); 


  

  // Apply effects from purchased shop items
  useEffect(() => {
    const activeIntervals = [];
    const effects = { enqueueDelta, setStallStones, setGold, stone };

    // Run effects for purchased items
    shop.shopItems.forEach(item => {
      const ownedCount = purchased[item.id] || 0;
      if (ownedCount > 0) {
        const intervalId = item.effect?.(effects);
        if (intervalId) activeIntervals.push(intervalId);
      }
    });

  return () => activeIntervals.forEach(clearInterval);
}, [purchased]);


useEffect(() => {
  const interval = setInterval(() => {
    setStallStones(s => {
      if (s <= 0) return s; // no stones, no update

      const stoneValue = market.getStoneValue();

      setGold(g => g + stoneValue);
      market.fluctuateDemand();

      return s - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, []);




  // Handle buying an item
  const handleBuy = (item) => {
    if (gold >= item.cost) {
      setGold(g => g - item.cost);
      setPurchased(p => ({ 
        ...p, 
        [item.id]: (p[item.id] || 0) + 1 
      }));

      // Optional: immediate effect application
      item.effect?.({ enqueueDelta, setStallStones, setGold, stone });
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your progress?")) {
      resetState();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
      <h1 className="text-3xl font-bold">Stonecutter</h1>
      <p className="text-lg">Stone: {count}</p>
      <p className="text-sm text-gray-600">Production: {productionRate.toFixed(2)}/sec</p>
      <div className="space-x-4">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 transition"
          onClick={() => 
          {
              enqueueDelta(1, true); // manual action
          }
             
          }
        >
          Click to Generate
        </button>
        <button
          onClick={() => {
            if (count > 0) {
              enqueueDelta(-1, true); // manual action
              setStallStones(s => s + 1);
            }
          }}
        >
          Send 1 stone to market
        </button>

        <button
          className="px-6 py-3 bg-red-500 text-white rounded-2xl shadow hover:bg-red-600 transition"
          onClick={handleReset}
        >
          Reset Progress
        </button>
      </div>
      <div style={{ marginTop: '1rem' }}>
      <p>Stones in stall: {stallStones}</p>
      <p>Gold: {gold}</p>
      <p>Current stone price: {market.getStoneValue()} gold per stone  (demand: {(market.getDemand() * 100).toFixed(0)}%)</p>

      <h3>Shop</h3>
      {shop.shopItems
        .filter(item => gold >= item.cost * (item.revealFraction ?? 1))
        .map(item => {
          const count = purchased[item.id] || 0;
          return (
            <div key={item.id}>
              <button
                onClick={() => handleBuy(item)}
                disabled={gold < item.cost}
              >
                Buy {item.name} ({item.cost} gold)
                {count > 0 ? ` (Owned: ${count})` : ''}
              </button>
              <p>{item.description}</p>
            </div>
          );
        })}


      </div>

    </div>
  );
}
