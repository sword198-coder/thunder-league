function extractProps(err: unknown): Record<string, unknown> {
  if (!err || typeof err !== "object") return { value: err };
  const extracted: Record<string, unknown> = {};
  for (const key of Object.getOwnPropertyNames(err)) {
    extracted[key] = (err as Record<string, unknown>)[key];
  }
  extracted.name = (err as Error).name;
  extracted.message = (err as Error).message;
  extracted.stack = (err as Error).stack;
  return extracted;
}

type LogLevel = "info" | "warn" | "error";

const log = (level: LogLevel, message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  const prefix = `[ThunderLeague] [${timestamp}] [${level.toUpperCase()}]`;

  if (typeof console[level] === "function") {
    console[level](`${prefix} ${message}`);
    if (data !== undefined) {
      console[level](`${prefix} DATA:`, data);
      console[level](`${prefix} EXTRACTED:`, extractProps(data));
    }
  }
};

export const logger = {
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),
};
