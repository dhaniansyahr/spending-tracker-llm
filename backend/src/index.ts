import app from "@/app/instance.js";
import * as Graceful from "@/pkg/graceful/index.js";
import Logger from "@/pkg/logger/index.js";

function parseArguments(args: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (let i = 2; i < args.length; i++) {
    const arg = args[i].replace(/^--/, "");
    const [key, value] = arg.split("=");
    if (key) parsed[key] = value ?? "true";
  }
  return parsed;
}

const args = parseArguments(process.argv);

if (args["service"] === "rest") {
  app.restApp();
  Logger.info("REST server started", {
    port: process.env.BACKEND_PORT ?? 3001,
    environment: process.env.NODE_ENV ?? "development",
  });
} else {
  app.restApp();
}

async function gracefulShutdown() {
  Logger.info("Stopping server...", {});
  await Graceful.shutdownProcesses();
  process.exit(0);
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
