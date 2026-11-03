const started = Date.now();

function stamp(): string {
  return `${String(Date.now() - started).padStart(6, " ")}ms`;
}

export function log(step: string, message: string, extra?: unknown): void {
  const suffix = extra === undefined ? "" : ` ${typeof extra === "string" ? extra : JSON.stringify(extra)}`;
  console.log(`[${stamp()}] ${step.padEnd(9)} ${message}${suffix}`);
}

export function warn(step: string, message: string, extra?: unknown): void {
  const suffix = extra === undefined ? "" : ` ${typeof extra === "string" ? extra : JSON.stringify(extra)}`;
  console.warn(`[${stamp()}] ${step.padEnd(9)} WARN ${message}${suffix}`);
}

export function fail(step: string, message: string, error?: unknown): void {
  const detail =
    error instanceof Error ? `: ${error.message}` : error === undefined ? "" : `: ${String(error)}`;
  console.error(`[${stamp()}] ${step.padEnd(9)} ERROR ${message}${detail}`);
}
