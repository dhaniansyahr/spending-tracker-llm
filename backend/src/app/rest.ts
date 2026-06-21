import * as Graceful from "@/pkg/graceful/index.js";
import server from "@/server/instance.js";

export function startRestApp() {
  const app = server.restServer();
  const port = Number(process.env.BACKEND_PORT ?? 3001);

  const restServer = Bun.serve({
    fetch: app.fetch,
    port,
  });

  Graceful.registerProcessForShutdown("rest-server", () => restServer.stop());

  console.log(`Backend running on http://localhost:${port}`);
}
