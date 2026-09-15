import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string, public code: string = "error") {
    super(message);
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "not_found", detail: `No route for ${req.method} ${req.path}` });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.code, detail: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(422).json({ error: "validation_error", detail: err.errors });
  }
  console.error("[unhandled_error]", err);
  res.status(500).json({ error: "internal_error", detail: "An unexpected error occurred." });
}
