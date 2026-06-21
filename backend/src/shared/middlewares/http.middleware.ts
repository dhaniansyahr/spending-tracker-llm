import { Context, Next } from "hono";
import Logger from "@/pkg/logger/index.js";
import { initHttpTracerData, tracerStorage } from "@/pkg/logger/tracer.js";

export async function httpLogger(c: Context, next: Next) {
  if (!c.req.path.startsWith("/api/")) {
    await next();
    return;
  }

  const tracerData = initHttpTracerData(c);

  await tracerStorage.run(tracerData, async () => {
    Logger.info("Request started", { method: tracerData.method, url: tracerData.url });
    await next();
    const duration = Date.now() - tracerData.startTime;
    Logger.info("Request completed", {
      method: tracerData.method,
      url: tracerData.url,
      duration: `${duration}ms`,
    });
  });
}
