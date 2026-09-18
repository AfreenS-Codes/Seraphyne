import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { getMistakesForStudent } from "../services/mistakeMemoryService";
import { generateRecommendation } from "../services/recommendationService";
import { getCompetency } from "../services/competencyService";
import { listSessionsForStudent } from "../services/sessionService";
import { askStudyCompanion, checkStudyCompanionHealth } from "../services/aiCompanionService";
import { z } from "zod";

const router = Router();

router.get("/mistakes", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    res.json(await getMistakesForStudent(req.user!.userId));
  } catch (err) {
    next(err);
  }
});

router.get("/recommendations", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    res.json(await generateRecommendation(req.user!.userId));
  } catch (err) {
    next(err);
  }
});

router.get("/dashboard", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const studentId = req.user!.userId;
    const [competency, mistakes, sessions] = await Promise.all([
      getCompetency(studentId),
      getMistakesForStudent(studentId),
      listSessionsForStudent(studentId),
    ]);
    const completedSessions = sessions.filter((s: any) => s.status === "completed");
    const commonMistakes = mistakes
      .filter((m: any) => !m.resolved)
      .sort((a: any, b: any) => b.frequency - a.frequency)
      .slice(0, 5);

    let recommendation = null;
    try {
      recommendation = await generateRecommendation(studentId);
    } catch {
      recommendation = null;
    }

    res.json({
      competencyScore: competency?.competencyScore ?? 0,
      reasoningScore: competency?.reasoningScore ?? 0,
      casesCompleted: completedSessions.length,
      cardiologyProgress: completedSessions.length, // MVP: single active domain
      commonMistakes,
      weakSkills: commonMistakes.map((m: any) => m.mistakeType),
      recentSessions: sessions.slice(0, 5),
      recommendedCase: recommendation,
      improvementTrend: competency?.history ?? [],
    });
  } catch (err) {
    next(err);
  }
});

router.get("/ai-companion/health", requireAuth, async (_req, res, next) => {
  try {
    const available = await checkStudyCompanionHealth();
    res.json({ available });
  } catch (err) {
    next(err);
  }
});

const askSchema = z.object({
  sessionId: z.string(),
  domain: z.string(),
  subject: z.string().optional(),
  topic: z.string().optional(),
  studentLevel: z.string().optional(),
  message: z.string().min(1),
});

router.post("/ai-companion/ask", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = askSchema.parse(req.body);
    const result = await askStudyCompanion({ ...body, studentId: req.user!.userId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
