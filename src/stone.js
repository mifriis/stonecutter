import { useState, useEffect, useRef } from 'react';

let latestCount = 0; // external reference for saving

export function useStone(initialCount = 0) {
  const [count, setCount] = useState(initialCount);
  const pendingDeltaRef = useRef(0);

  // Queue changes
  const enqueueDelta = (delta) => {
    pendingDeltaRef.current += delta;
  };

  // Apply queued changes on interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingDeltaRef.current !== 0) {
        setCount(c => {
          const updated = c + pendingDeltaRef.current;
          pendingDeltaRef.current = 0;
          latestCount = updated < 0 ? 0 : updated; // update global ref
          return latestCount;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Sync latestCount on any direct change
  useEffect(() => {
    latestCount = count;
  }, [count]);

  return { count, enqueueDelta };
}

// External read access for saving
export function getCount() {
  return latestCount;
}
