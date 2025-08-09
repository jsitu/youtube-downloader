const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, limit: number = 10): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + 60000, // Reset after 1 minute
    });
    return true;
  }

  if (userLimit.count >= limit) {
    return false;
  }

  userLimit.count++;
  return true;
}