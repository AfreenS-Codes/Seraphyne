import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { clinicalEngineClient } from "../services/clinicalEngineClient";

const router = Router();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const cases = await clinicalEngineClient.listCases();
    res.json(cases);
  } catch (err) {
    next(err);
  }
});

router.get("/:caseId", requireAuth, async (req, res, next) => {
  try {
    const c = await clinicalEngineClient.getCase(req.params.caseId);
    res.json(c);
  } catch (err) {
    next(err);
  }
});

export default router;
