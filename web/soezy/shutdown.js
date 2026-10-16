"use strict";

function registerGracefulShutdown({ server, io, botBridge, timers = [], logger, timeoutMs = 10000 }) {
  let closing = false;

  async function shutdown(signal) {
    if (closing) return;
    closing = true;
    logger.info(`Received ${signal}; closing server`);

    timers.forEach(timer => clearInterval(timer));
    if (typeof botBridge?.close === "function") botBridge.close();

    const timeout = setTimeout(() => {
      logger.error("Graceful shutdown timed out");
      process.exit(1);
    }, timeoutMs);
    timeout.unref();

    try {
      await new Promise(resolve => io.close(resolve));
      await new Promise(resolve => server.close(resolve));
      clearTimeout(timeout);
      logger.info("Shutdown complete");
      process.exit(0);
    } catch (err) {
      logger.error("Shutdown failed", err);
      process.exit(1);
    }
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

module.exports = { registerGracefulShutdown };
