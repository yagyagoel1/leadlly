import { Response, Request, NextFunction } from "express";

// Async handler middleware to handle async functions
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | void) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };
