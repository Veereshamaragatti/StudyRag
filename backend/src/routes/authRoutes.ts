import { Router } from 'express';
import passport from 'passport';
import {
  googleAuth,
  googleAuthCallback,
  logout,
  getCurrentUser,
} from '../controllers/authController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const router = Router();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleAuthCallback
);

// Logout
router.post('/logout', isAuthenticated, logout);

// Get current user
router.get('/me', isAuthenticated, getCurrentUser);

export default router;
