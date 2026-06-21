import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { httpLogger } from "@/shared/middlewares/http.middleware.js";
import { PrismaInstance } from "@/pkg/prisma/index.js";
import routes from "@/routes/index.js";

export default function createRestServer() {
  const allowedOrigins = process.env.ALLOWED_ORIGINS;
  const corsOptions =
    !allowedOrigins || allowedOrigins === "*"
      ? {}
      : { origin: allowedOrigins.split(",") };

  const app = new Hono();

  app.use("*", cors(corsOptions));
  app.use("*", httpLogger);
  app.use("/storage/*", serveStatic({ root: "./" }));

  app.route("/api", routes);

  PrismaInstance.getInstance();

  return app;
}
