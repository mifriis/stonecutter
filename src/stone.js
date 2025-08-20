import { useState, useEffect, useRef } from 'react';

let latestCount = 0; // external reference for saving

export function useStone(initialCount = 0) {
  const [count, setCount] = useState(initialCount);
  const [productionRate, setProductionRate] = useState(0);
  const pendingDeltaRef = useRef(0);
  const manualDeltaRef = useRef(0);

  // Single queue for all changes
  const deltaRef = useRef(0);

  // Add to the queue and optionally process immediately
  const enqueueDelta = (delta, processNow = false) => {
    deltaRef.current += delta;
    if (processNow) {
      processQueue();
    }
  };

  // Process the queue
  const processQueue = () => {
    // Capture current production rate before processing
    const currentProduction = deltaRef.current;
    
    setCount(c => {
      const updated = Math.max(0, c + deltaRef.current);
      latestCount = updated;
      deltaRef.current = 0;
      return updated;
    });

    // Only update production rate if it's positive (ignoring cart removals)
    if (currentProduction > 0) {
      setProductionRate(currentProduction);
    }
  };

  // Process queue on interval
  useEffect(() => {
    const interval = setInterval(processQueue, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync latestCount on any direct change
  useEffect(() => {
    latestCount = count;
  }, [count]);

  return { count, enqueueDelta, productionRate };
}

// External read access for saving
export function getCount() {
  return latestCount;
}
