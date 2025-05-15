let demand = 0.01; // range: 0.1 to 1.0

export function getState() {
  return { demand };
}

export function setState(state) {
  demand = state?.demand ?? 0.5;
}

export function getDemand() {
  return demand;
}

export function fluctuateDemand() {
  // Simulate market fluctuation
  demand += (Math.random() - 0.5) * 0.1;
  demand = Math.max(0.1, Math.min(1.0, demand)); // clamp
}

export function getStoneValue() {
  return Math.floor(10 * demand); // e.g. 1–10 gold per stone
}
