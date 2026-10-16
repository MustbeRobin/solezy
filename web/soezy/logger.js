"use strict";

function serializeMeta(meta) {
  if (!meta) return "";
  if (meta instanceof Error) return ` ${meta.stack || meta.message}`;
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return ` ${String(meta)}`;
  }
}

function createLogger(scope) {
  function write(level, message, meta) {
    const line = `[${scope}] ${message}${serializeMeta(meta)}`;
    const method = level === "error" ? "error" : level === "warn" ? "warn" : "log";
    console[method](line);
  }

  return {
    info: (message, meta) => write("info", message, meta),
    warn: (message, meta) => write("warn", message, meta),
    error: (message, meta) => write("error", message, meta),
    child: childScope => createLogger(`${scope}:${childScope}`)
  };
}

module.exports = { createLogger };
