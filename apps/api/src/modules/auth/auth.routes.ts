import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../auth/auth.middleware';
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from './auth.validator';
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  meHandler,
  changePasswordHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from './auth.controller';
import {
  loginRateLimiter,
  refreshRateLimiter,
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter,
} from './auth.rate-limit';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication & Authorization endpoints
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials or account disabled
 *       500:
 *         description: Internal server error
 */
router.post('/login', loginRateLimiter, validate(loginSchema), loginHandler);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh Access Token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
router.post('/refresh', refreshRateLimiter, validate(refreshTokenSchema), refreshHandler);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent (returns token in dev mode)
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/forgot-password', forgotPasswordRateLimiter, validate(forgotPasswordSchema), forgotPasswordHandler);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset Password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid or expired reset token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password', resetPasswordRateLimiter, validate(resetPasswordSchema), resetPasswordHandler);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User Logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/logout', requireAuth, logoutHandler);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get Current User
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/me', requireAuth, meHandler);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change Password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Incorrect current password
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/change-password', requireAuth, validate(changePasswordSchema), changePasswordHandler);

export default router;
