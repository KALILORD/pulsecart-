import { warn } from "./log";

const USER_AGENT =
  "Mozilla/5.0 (compatible; PulseCartBot/0.1; +https://pulsecart.pages.dev) AppleWebKit/537.36 (KHTML, like Gecko)";

export interface FetchOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  accept?: string;
}

async function request(url: string, options: FetchOptions): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? 20_000;
  const retries = options.retries ?? 1;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          "user-agent": USER_AGENT,
          accept: options.accept ?? "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
          "accept-language": "en-ZA,en;q=0.9",
          ...options.headers,
        },
      });

      if (response.ok) return response;

      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}`);
      } else {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
    } catch (error) {
      lastError = error;
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Request failed: ${url}`);
}

export async function fetchText(url: string, options: FetchOptions = {}): Promise<string | null> {
  try {
    const response = await request(url, options);
    return await response.text();
  } catch (error) {
    warn("http", `GET failed ${url}`, (error as Error).message);
    return null;
  }
}

export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T | null> {
  const text = await fetchText(url, {
    ...options,
    accept: "application/json,text/plain;q=0.9,*/*;q=0.8",
  });
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    warn("http", `Invalid JSON from ${url}`, (error as Error).message);
    return null;
  }
}

export async function postJson<T>(
  url: string,
  body: unknown,
  options: FetchOptions = {},
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: "POST",
      redirect: "follow",
      signal: AbortSignal.timeout(options.timeoutMs ?? 20_000),
      headers: {
        "user-agent": USER_AGENT,
        "content-type": "application/json",
        accept: "application/json",
        ...options.headers,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    if (!response.ok) {
      warn("http", `POST ${url} responded ${response.status}`, text.slice(0, 300));
      return null;
    }
    return text ? (JSON.parse(text) as T) : ({} as T);
  } catch (error) {
    warn("http", `POST failed ${url}`, (error as Error).message);
    return null;
  }
}
