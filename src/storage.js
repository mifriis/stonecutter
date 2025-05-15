const STORAGE_KEY = 'stonecutter-state';
const RESET_IN_PROGRESS = 'reset-in-progress';

export function loadState(setters) {
  if (sessionStorage.getItem(RESET_IN_PROGRESS)) {
    sessionStorage.removeItem(RESET_IN_PROGRESS);
    return;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const state = JSON.parse(raw);
    if (!state) return;

    if (setters.setCount) setters.setCount(state.count || 0);
    if (setters.setGold) setters.setGold(state.gold || 0);
    if (setters.setStallStones) setters.setStallStones(state.stallStones || 0);
    if (setters.setPurchased) setters.setPurchased(state.shop?.purchased || {});
    if (setters.market) setters.market.setState(state.market);
    if (setters.shop) setters.shop.setState(state.shop);
  } catch {
    // ignore parse errors
  }
}

export function saveState(state) {
  if (sessionStorage.getItem(RESET_IN_PROGRESS)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  sessionStorage.setItem(RESET_IN_PROGRESS, '1');
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}
