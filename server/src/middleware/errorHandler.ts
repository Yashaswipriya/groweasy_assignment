import { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof Error && err.message.includes("File too large")) {
    return res.status(413).json({ error: "File exceeds the 5MB upload limit." });
  }

  const message = err instanceof Error ? err.message : "Something went wrong.";
  return res.status(500).json({ error: message });
}
