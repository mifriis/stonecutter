import { useState, useEffect } from 'react';
import { loadState, saveState, resetState } from './storage';
import { shopItems } from './shop';

export default function Stonecutter() {
  const [count, setCount] = useState(0);
  const [purchased, setPurchased] = useState({});
  const [loaded, setLoaded] = useState(false);

  // Load state once
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setCount(saved.count ?? 0);
      setPurchased(saved.purchased ?? {});
    }
    setLoaded(true);
  }, []);

  // Save state on changes
  useEffect(() => {
    if (!loaded) return;
    saveState({ count, purchased });
  }, [count, purchased, loaded]);

  // Apply effects from purchased items
  useEffect(() => {
    const activeIntervals = [];

    shopItems.forEach(item => {
      if (purchased[item.id]) {
        const interval = item.effect(setCount);
        activeIntervals.push(interval);
      }
    });

    return () => activeIntervals.forEach(clearInterval);
  }, [purchased]);

  const handleBuy = (item) => {
    if (count >= item.cost && !purchased[item.id]) {
      setCount(c => c - item.cost);
      setPurchased(prev => ({ ...prev, [item.id]: true }));
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
          className="px-6 py-3 bg-red-500 text-white rounded-2xl shadow hover:bg-red-600 transition"
          onClick={handleReset}
        >
          Reset Progress
        </button>
      </div>
            <div style={{ marginTop: '1rem' }}>
        <h3>Store</h3>
        {shopItems.map(item => (
          <div key={item.id}>
            <button
              onClick={() => handleBuy(item)}
              disabled={purchased[item.id] || count < item.cost}
            >
              Buy {item.name} ({item.cost})
            </button>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
