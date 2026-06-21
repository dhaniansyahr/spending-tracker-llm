import { AsyncLocalStorage } from "async_hooks";
import { Context } from "hono";
import { ulid } from "ulid";

export interface TracerData {
  spanId: string;
  resource: string;
  startTime: number;
  method?: string;
  url?: string;
}

export const tracerStorage = new AsyncLocalStorage<TracerData>();

export function initHttpTracerData(c: Context): TracerData {
  return {
    spanId: ulid(),
    resource: c.req.path || process.env.SERVICE_NAME || "unknown",
    startTime: Date.now(),
    method: c.req.method,
    url: c.req.url,
  };
}

export function getTracerData(): TracerData {
  let data = tracerStorage.getStore();
  if (!data) {
    data = {
      spanId: ulid(),
      resource: process.env.SERVICE_NAME || "unknown",
      startTime: Date.now(),
      method: "N/A",
      url: "N/A",
    };
    tracerStorage.enterWith(data);
  }
  return data;
}
