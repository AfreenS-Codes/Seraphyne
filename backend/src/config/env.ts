import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongodbUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "dev-insecure-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clinicalEngineBaseUrl: process.env.CLINICAL_ENGINE_BASE_URL || "http://localhost:8010",
  aiServiceBaseUrl: process.env.AI_SERVICE_BASE_URL || "",
  aiServiceApiKey: process.env.AI_SERVICE_API_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || "*",
};

export function validateConfig(): string[] {
  const warnings: string[] = [];
  if (config.jwtSecret === "dev-insecure-secret-change-me") {
    warnings.push("JWT_SECRET is using an insecure default — set it in .env for anything beyond local dev.");
  }
  if (!config.mongodbUri) {
    warnings.push("MONGODB_URI not set — running with in-memory data fallback (see db/connection.ts).");
  }
  if (!config.aiServiceBaseUrl) {
    warnings.push("AI_SERVICE_BASE_URL not set — AI Study Companion integration will report unavailable.");
  }
  return warnings;
}
