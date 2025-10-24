import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please log in.' });
};

export const attachUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    (req as any).userId = (req.user as any)._id;
  }
  next();
};
