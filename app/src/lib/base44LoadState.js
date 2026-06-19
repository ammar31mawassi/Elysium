const DEFAULT_TIMEOUT_MS = 10000;

export function withRequestTimeout(promise, message = "Request timed out", timeout = DEFAULT_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), timeout);
    }),
  ]);
}

export function base44ErrorMessage(error, fallback = "Loading failed. Please try again.") {
  const message = [
    error?.message,
    error?.data?.message,
    error?.data?.detail,
    error?.response?.data?.message,
    error?.response?.data?.detail,
  ].filter(Boolean).join(" ");

  if (/rate limit|too many requests|429/i.test(message) || error?.status === 429 || error?.response?.status === 429) {
    return "Base44 rate limit exceeded. Wait a moment, then retry.";
  }

  if (/timed out|timeout/i.test(message)) {
    return "This took too long to load. Check your connection and retry.";
  }

  return message || fallback;
}

export async function loadBase44Collection(source, timeoutMessage) {
  const promise = typeof source === "function" ? source() : source;
  return withRequestTimeout(promise, timeoutMessage);
}
