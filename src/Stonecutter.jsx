import { useState, useEffect, useRef } from 'react';
import * as market from './market';
import * as shop from './shop';
import * as storage from './storage';

export default function Stonecutter() {
  const [count, setCount] = useState(0);
  const [gold, setGold] = useState(0);
  const [stallStones, setStallStones] = useState(0);
  const [purchased, setPurchased] = useState({});
  const [loaded, setLoaded] = useState(false);
  
  // Load once
  useEffect(() => {
    storage.loadState({
      setCount,
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
      count,
      gold,
      stallStones,
      shop: { purchased },
      market: market.getState(),
    });
  }, [count, gold, stallStones, purchased, loaded]);

  

  // Apply effects from purchased shop items
  useEffect(() => {
    const activeIntervals = [];
    const effects = { setCount, setStallStones, setGold };

    shop.shopItems.forEach(item => {
      if (purchased[item.id]) {
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
    if (gold >= item.cost && !purchased[item.id]) {
      setGold(g => g - item.cost);
      setPurchased(p => ({ ...p, [item.id]: true }));

      // Optional: immediate effect application
      item.effect?.({ setCount, setStallStones, setGold });
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
      <div className="space-x-4">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 transition"
          onClick={() => setCount(count + 1)}
        >
          Click to Generate
        </button>
        <button
          onClick={() => {
            if (count > 0) {
              setCount(c => c - 1);
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

      <h3>Available</h3>
      {shop.shopItems
        .filter(item =>
          !purchased[item.id] &&
          gold >= item.cost * (item.revealFraction ?? 1)
        )
        .map(item => (
          <div key={item.id}>
            <button
              onClick={() => handleBuy(item)}
              disabled={gold < item.cost}
            >
              Buy {item.name} ({item.cost} gold)
            </button>
            <p>{item.description}</p>
          </div>
      ))}

      <h3>Owned</h3>
      {shop.shopItems
        .filter(item => purchased[item.id])
        .map(item => (
          <div key={item.id}>
            <button disabled>
              {item.name} (Owned)
            </button>
            <p>{item.description}</p>
          </div>
      ))}


      </div>

    </div>
  );
}
