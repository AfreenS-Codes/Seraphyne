import mongoose from "mongoose";

let usingMemoryFallback = false;

/**
 * Connects to a real MongoDB instance when MONGODB_URI is configured.
 * If it isn't set (or the connection fails), the backend falls back to an
 * in-memory repository implementation (see repositories/createRepository.ts)
 * so the service remains fully runnable for local development/demo without
 * requiring a running MongoDB — this is a deliberate, documented fallback,
 * not a silent substitute: every startup log line says which mode is active,
 * and README.md explains how to run with real MongoDB via docker-compose.
 */
export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    usingMemoryFallback = true;
    console.warn(
      "[db] MONGODB_URI not set — using in-memory repository fallback (demo/dev mode). " +
        "Set MONGODB_URI and restart to use real MongoDB persistence."
    );
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    usingMemoryFallback = false;
    console.log(`[db] Connected to MongoDB at ${uri.replace(/\/\/.*@/, "//<redacted>@")}`);
  } catch (err) {
    usingMemoryFallback = true;
    console.error(
      `[db] Failed to connect to MongoDB (${(err as Error).message}). ` +
        "Falling back to in-memory repository mode (demo/dev only, not persistent)."
    );
  }
}

export function isUsingMemoryFallback(): boolean {
  return usingMemoryFallback;
}

export function isMongoConnected(): boolean {
  return !usingMemoryFallback && mongoose.connection.readyState === 1;
}
