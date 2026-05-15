export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const COOKIE_NAME = 'rag_quota_v1';
export const MAX_DAILY_QUOTA = 3;

export const getQuotaFromCookie = () => {
  const name = `${COOKIE_NAME}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      try {
        const val = JSON.parse(c.substring(name.length, c.length));
        if (Date.now() > val.resetTimestamp) {
          return { count: 0, resetTimestamp: null };
        }
        return val;
      } catch (e) {}
    }
  }
  // LocalStorage fallback
  try {
    const item = localStorage.getItem(COOKIE_NAME);
    if (item) {
      const val = JSON.parse(item);
      if (Date.now() > val.resetTimestamp) {
        localStorage.removeItem(COOKIE_NAME);
        return { count: 0, resetTimestamp: null };
      }
      return val;
    }
  } catch (e) {}

  return { count: 0, resetTimestamp: null };
};

export const incrementQuotaCookie = () => {
  const current = getQuotaFromCookie();
  const now = Date.now();
  let resetTs = current.resetTimestamp;

  if (!resetTs || now > resetTs) {
    resetTs = now + 24 * 60 * 60 * 1000; // 24 Hours from 1st question
  }

  const newCount = (current.count || 0) + 1;
  const newData = { count: newCount, resetTimestamp: resetTs };

  const maxAgeSec = Math.max(1, Math.floor((resetTs - now) / 1000));
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(newData))}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;

  try {
    localStorage.setItem(COOKIE_NAME, JSON.stringify(newData));
  } catch (e) {}

  return newData;
};

export const getTimeUntilResetString = (resetTimestamp) => {
  if (!resetTimestamp) return '24h 00m';
  const diffMs = resetTimestamp - Date.now();
  if (diffMs <= 0) return '0m';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
};
