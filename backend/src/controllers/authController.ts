import { Request, Response } from 'express';

export const googleAuth = (req: Request, res: Response) => {
  // This is handled by passport middleware
};

export const googleAuthCallback = (req: Request, res: Response) => {
  // Successful authentication, redirect to frontend
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
};

export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};

export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = req.user as any;
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  });
};
