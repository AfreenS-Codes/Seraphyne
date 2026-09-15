import { createApp } from "./app";
import { connectDb } from "./db/connection";
import { config, validateConfig } from "./config/env";

async function main() {
  await connectDb();
  for (const warning of validateConfig()) {
    console.warn(`[startup_warning] ${warning}`);
  }
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[server] SERAPHYNE backend listening on port ${config.port}`);
  });
}

main().catch((err) => {
  console.error("[fatal] Failed to start server:", err);
  process.exit(1);
});
