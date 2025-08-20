import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useStone } from './stone';
import { renderHook, act } from '@testing-library/react';
import * as shop from './shop';

describe('stone generation', () => {
  beforeEach(() => {
    // Reset the module state before each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should add 1 stone when manually generating', () => {
    // Render the hook
    const { result } = renderHook(() => useStone(0));
    
    // Verify initial count is 0
    expect(result.current.count).toBe(0);
    
    // Generate one stone manually
    act(() => {
      result.current.enqueueDelta(1, true);
    });
    
    // Verify count increased by 1
    expect(result.current.count).toBe(1);
  });

  it('should not allow negative stone count', () => {
    const { result } = renderHook(() => useStone(0));
    
    // Try to remove a stone when count is 0
    act(() => {
      result.current.enqueueDelta(-1, true);
    });
    
    // Verify count stayed at 0
    expect(result.current.count).toBe(0);
  });

  describe('generator production', () => {
    it('should produce stones correctly with real generators', () => {
        const { result } = renderHook(() => useStone(0));
      const { shopItems, setState } = require('./shop');
      const generator = shopItems.find(item => item.id === 'gen1');
      
      // Set up 10 generators
      setState({ purchased: { gen1: 10 } });
      
      // Start the generator
      const interval = generator.effect({ 
        enqueueDelta: result.current.enqueueDelta,
        stone: { getCount: () => result.current.count }
      });

      // Let it run for 1 seconds
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Clean up
      clearInterval(interval);

      // Should produce around 7 stones per second with 10 generators
      expect(result.current.count).toBeGreaterThan(6);  // Allow some rounding variation
      expect(result.current.count).toBeLessThan(8);     // Allow some rounding variation
      expect(Number.isInteger(result.current.count)).toBe(true);
      
      // Production rate should match actual production
      expect(result.current.productionRate).toBe(result.current.count);
    });

    it('should accumulate stones over time with real generators', () => {
      const { result } = renderHook(() => useStone(0));
      const { shopItems, setState } = require('./shop');
      const generator = shopItems.find(item => item.id === 'gen1');
      
      // Set up 10 generators
      setState({ purchased: { gen1: 10 } });
      
      // Start the generator
      const interval = generator.effect({ 
        enqueueDelta: result.current.enqueueDelta,
        stone: { getCount: () => result.current.count }
      });

      // Let it run for 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Clean up
      clearInterval(interval);

      // Should have accumulated around 35 stones (7 per second * 5 seconds)
      expect(result.current.count).toBeGreaterThan(32);  // Allow some rounding variation
      expect(result.current.count).toBeLessThan(37);     // Allow some rounding variation
      expect(Number.isInteger(result.current.count)).toBe(true);
    });
  });
});
