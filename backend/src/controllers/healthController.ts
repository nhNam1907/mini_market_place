import type { HealthResponse } from "@market-place/shared/api";
import type { Request, Response } from "express";

export function getHealth(_req: Request, res: Response<HealthResponse>): void {
  res.json({
    success: true,
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
}
