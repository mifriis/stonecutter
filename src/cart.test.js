import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStone } from './stone';
import * as shop from './shop';

describe('cart mechanics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Reset shop state
    shop.setState({ purchased: {} });
  });

  it('should move stones from pile to stall based on cart capacity', () => {
    // Create stone hook with initial stones
    const { result } = renderHook(() => useStone(20));
    
    // Set up stall tracking
    let stallStones = 0;
    const setStallStones = (updater) => {
      if (typeof updater === 'function') {
        stallStones = updater(stallStones);
      } else {
        stallStones = updater;
      }
    };
    
    // Get cart item and set up 3 carts
    const { shopItems, setState } = shop;
    const cart = shopItems.find(item => item.id === 'cart');
    setState({ purchased: { cart: 3 } });
    
    // Start cart effect
    const interval = cart.effect({ 
      enqueueDelta: result.current.enqueueDelta,
      setStallStones,
      stone: { getCount: () => result.current.count }
    });

    // Let it run for one second
    act(() => {
      vi.advanceTimersByTime(1001);
    });

    // Clean up
    clearInterval(interval);

    // Should have moved 3 stones (1 per cart) from pile to stall
    expect(result.current.count).toBe(17); // 20 - 3
    expect(stallStones).toBe(3);
  });

  it('should not move more stones than available', () => {
    // Create stone hook with just 2 stones
    const { result } = renderHook(() => useStone(2));
    
    let stallStones = 0;
    const setStallStones = (updater) => {
      if (typeof updater === 'function') {
        stallStones = updater(stallStones);
      } else {
        stallStones = updater;
      }
    };
    
    // Set up 5 carts (more than available stones)
    const { shopItems, setState } = shop;
    const cart = shopItems.find(item => item.id === 'cart');
    setState({ purchased: { cart: 5 } });
    
    const interval = cart.effect({ 
      enqueueDelta: result.current.enqueueDelta,
      setStallStones,
      stone: { getCount: () => result.current.count }
    });

    act(() => {
      vi.advanceTimersByTime(1001);
    });

    clearInterval(interval);

    // Should only move the 2 available stones
    expect(result.current.count).toBe(0);
    expect(stallStones).toBe(2);
  });

  it('should not move stones when none available', () => {
    // Create stone hook with no stones
    const { result } = renderHook(() => useStone(0));
    
    let stallStones = 0;
    const setStallStones = (updater) => {
      if (typeof updater === 'function') {
        stallStones = updater(stallStones);
      } else {
        stallStones = updater;
      }
    };
    
    // Set up 3 carts
    const { shopItems, setState } = shop;
    const cart = shopItems.find(item => item.id === 'cart');
    setState({ purchased: { cart: 3 } });
    
    const interval = cart.effect({ 
      enqueueDelta: result.current.enqueueDelta,
      setStallStones,
      stone: { getCount: () => result.current.count }
    });

    act(() => {
      vi.advanceTimersByTime(1001);
    });

    clearInterval(interval);

    // Should not move any stones or affect stall
    expect(result.current.count).toBe(0);
    expect(stallStones).toBe(0);
  });

  it('should accumulate stall stones over time', () => {
    // Create stone hook with plenty of stones
    const { result } = renderHook(() => useStone(50));
    
    let stallStones = 0;
    const setStallStones = (updater) => {
      if (typeof updater === 'function') {
        stallStones = updater(stallStones);
      } else {
        stallStones = updater;
      }
    };
    
    // Set up 2 carts
    const { shopItems, setState } = shop;
    const cart = shopItems.find(item => item.id === 'cart');
    setState({ purchased: { cart: 2 } });
    
    const interval = cart.effect({ 
      enqueueDelta: result.current.enqueueDelta,
      setStallStones,
      stone: { getCount: () => result.current.count }
    });

    // Run for 3 seconds
    act(() => {
      vi.advanceTimersByTime(3001);
    });

    clearInterval(interval);

    // Should have moved 6 stones (2 carts * 3 seconds)
    expect(result.current.count).toBe(44); // 50 - 6
    expect(stallStones).toBe(6);
  });
});
