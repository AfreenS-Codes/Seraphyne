import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { connectDb } from "../db/connection";

process.env.JWT_SECRET = "test-secret";
process.env.MONGODB_URI = ""; // force in-memory fallback for unit tests

const app = createApp();

beforeAll(async () => {
  await connectDb(); // sets the in-memory fallback flag used by /health
});

describe("health", () => {
  it("returns ok and reports db mode", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.db_mode).toBe("in_memory_fallback");
  });
});

describe("auth", () => {
  const email = `test-${Date.now()}@seraphyne.app`;

  it("rejects signup with a short password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email, password: "short", name: "Test" });
    expect(res.status).toBe(422);
  });

  it("signs up a new user and returns a token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email, password: "password123", name: "Test User" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(email);
  });

  it("rejects duplicate signup", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email, password: "password123", name: "Test User" });
    expect(res.status).toBe(409);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({ email, password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({ email, password: "wrongpass" });
    expect(res.status).toBe(401);
  });

  it("returns the current user for /me with a valid token", async () => {
    const login = await request(app).post("/api/v1/auth/login").send({ email, password: "password123" });
    const token = login.body.token;
    const res = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
  });

  it("rejects /me without a token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects requests with a malformed token", async () => {
    const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
});

describe("protected routes without auth", () => {
  it("rejects /api/v1/cases without a token", async () => {
    const res = await request(app).get("/api/v1/cases");
    expect(res.status).toBe(401);
  });

  it("rejects /api/v1/dashboard without a token", async () => {
    const res = await request(app).get("/api/v1/dashboard");
    expect(res.status).toBe(401);
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
  });
});
