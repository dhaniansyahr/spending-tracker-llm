import { getTracerData } from "./tracer.js";
import { createLogTransport } from "./transport.js";

interface LogData {
  resource?: string;
  [key: string]: any;
}

class LoggerInstance {
  private static instance: LoggerInstance;
  private logger = createLogTransport();

  public static getInstance(): LoggerInstance {
    if (!LoggerInstance.instance) {
      LoggerInstance.instance = new LoggerInstance();
    }
    return LoggerInstance.instance;
  }

  private meta(data: LogData) {
    const tracer = getTracerData();
    return { data, spanId: tracer.spanId, resource: tracer.resource };
  }

  info(msg: string, data: LogData) {
    this.logger.info(msg, this.meta(data));
  }

  warning(msg: string, data: LogData) {
    this.logger.warn(msg, this.meta(data));
  }

  error(msg: string, data: any) {
    const tracer = getTracerData();
    const err = data?.error ?? data;
    this.logger.error(msg, {
      data: {
        error: {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          name: err instanceof Error ? err.name : "UnknownError",
        },
      },
      spanId: tracer.spanId,
      resource: tracer.resource,
    });
  }

  debug(msg: string, data: LogData) {
    this.logger.debug(msg, this.meta(data));
  }
}

const Logger = LoggerInstance.getInstance();
export default Logger;
