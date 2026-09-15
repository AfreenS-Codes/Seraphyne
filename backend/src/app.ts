import express from "express";
import cors from "cors";
import { config } from "./config/env";
import authRoutes from "./routes/auth";
import caseRoutes from "./routes/cases";
import sessionRoutes from "./routes/sessions";
import platformRoutes from "./routes/platform";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { isMongoConnected, isUsingMemoryFallback } from "./db/connection";

export function createApp() {
  const app = express();
  app.use(cors({ origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",") }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "seraphyne-backend",
      db_mode: isMongoConnected() ? "mongodb" : isUsingMemoryFallback() ? "in_memory_fallback" : "connecting",
    });
  });

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/cases", caseRoutes);
  app.use("/api/v1/sessions", sessionRoutes);
  app.use("/api/v1", platformRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
