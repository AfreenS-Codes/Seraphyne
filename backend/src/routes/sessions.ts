import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import * as sessionService from "../services/sessionService";

const router = Router();

router.post("/start", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { caseId } = z.object({ caseId: z.string() }).parse(req.body);
    const session = await sessionService.startSession(req.user!.userId, caseId);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const list = await sessionService.listSessionsForStudent(req.user!.userId);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.get("/:sessionId", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const session = await sessionService.getSession(req.params.sessionId, req.user!.userId);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

const actionSchema = z.object({
  actionType: z.enum(["history", "examination", "investigation"]),
  itemId: z.string(),
  label: z.string().optional(),
});

router.post("/:sessionId/actions", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = actionSchema.parse(req.body);
    const session = await sessionService.recordAction(
      req.params.sessionId,
      req.user!.userId,
      body.actionType,
      body.itemId,
      body.label
    );
    res.json(session);
  } catch (err) {
    next(err);
  }
});

router.post("/:sessionId/differentials", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { differentialIds } = z.object({ differentialIds: z.array(z.string()) }).parse(req.body);
    const session = await sessionService.updateDifferentials(
      req.params.sessionId,
      req.user!.userId,
      differentialIds
    );
    res.json(session);
  } catch (err) {
    next(err);
  }
});

router.post("/:sessionId/bayesian", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const result = await sessionService.runBayesianUpdate(req.params.sessionId, req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/:sessionId/decision", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { decisionId } = z.object({ decisionId: z.string() }).parse(req.body);
    const result = await sessionService.submitDecision(req.params.sessionId, req.user!.userId, decisionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
