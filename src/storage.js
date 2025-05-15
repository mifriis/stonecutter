const STORAGE_KEY = 'stonecutter-state';
const RESET_IN_PROGRESS = 'reset-in-progress';

export function loadState() {
  if (sessionStorage.getItem(RESET_IN_PROGRESS)) {
    sessionStorage.removeItem(RESET_IN_PROGRESS);
    return null; // skip loading if resetting
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  if (sessionStorage.getItem(RESET_IN_PROGRESS)) return; // skip save during reset
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  sessionStorage.setItem(RESET_IN_PROGRESS, '1');
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}
