
export function generateSessionId() {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  const timestamp = Date.now()
    .toString(36)
    .toUpperCase();

  return `SN-${timestamp}-${randomPart}`;
}

export function createExpiry(minutes = 10) {
  return new Date(
    Date.now() + minutes * 60 * 1000,
  ).toISOString();
}

