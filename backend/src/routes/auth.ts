import { Router } from "express";
import { z } from "zod";
import * as authService from "../services/authService";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

router.post("/signup", async (req, res, next) => {
  try {
    const body = signupSchema.parse(req.body);
    const result = await authService.signup(body.email, body.password, body.name);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/logout", requireAuth, async (_req, res) => {
  // Stateless JWT: logout is client-side token discard. Endpoint provided
  // for API completeness / future token-blacklist support.
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
