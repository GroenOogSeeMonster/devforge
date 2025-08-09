import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { 
  authenticate, 
  generateToken, 
  generateRefreshToken, 
  hashPassword, 
  comparePassword,
  logout 
} from '@middleware/authMiddleware';
import { databaseService } from '@services/DatabaseService';
import { UserRow } from '@db/db';
import { redisService } from '@services/RedisService';
import { logger, auditLog } from '@utils/logger';
import { 
  ValidationError, 
  AuthenticationError, 
  ConflictError,
  asyncHandler 
} from '@middleware/errorHandler';
import { rateLimit } from '@middleware/authMiddleware';

const router = Router();

// Validation schemas
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'),
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Last name is required and must be less than 50 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const passwordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

const passwordChangeValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must be at least 8 characters and contain uppercase, lowercase, number, and special character'),
];

// Helper function to check validation results
const checkValidation = (req: any, _res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  next();
};

// Register new user
router.post('/register', 
  rateLimit,
  registerValidation,
  checkValidation,
  asyncHandler(async (req: any, res: any) => {
    const { email, username, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await databaseService.findOne('users', { email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const existingUsername = await databaseService.findOne('users', { username });
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await databaseService.insert<UserRow>('users', {
      email,
      username,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      is_verified: false,
      is_active: true,
      role: 'user',
    });

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await redisService.set(`refresh_token:${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

    // Log registration
    auditLog('user_registered', user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    });

    // Remove sensitive data
    const { password_hash, ...userResponse } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
    });
  })
);

// Login user
router.post('/login',
  rateLimit,
  loginValidation,
  checkValidation,
  asyncHandler(async (req: any, res: any) => {
    const { email, password } = req.body;

    // Find user
    const user = await databaseService.findOne<UserRow>('users', { email });
    if (!user) {
      auditLog('login_failed', undefined, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        email,
        reason: 'User not found',
        success: false,
      });

      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      auditLog('login_failed', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        reason: 'Account inactive',
        success: false,
      });

      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      auditLog('login_failed', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        reason: 'Invalid password',
        success: false,
      });

      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await redisService.set(`refresh_token:${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

    // Update last login
    await databaseService.update('users', user.id, {
      last_login_at: new Date().toISOString(),
    });

    // Log successful login
    auditLog('user_login', user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    });

    // Remove sensitive data
    const { password_hash, ...userResponse } = user as any;

    res.json({
      success: true,
      data: {
        user: userResponse,
        token,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
    });
  })
);

// Refresh token
router.post('/refresh',
  rateLimit,
  asyncHandler(async (req: any, res: any) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    try {
      // Verify refresh token using central config secret for consistency
      const decoded: any = require('jsonwebtoken').verify(
        refreshToken,
        (require('@config/config') as any).config.auth.jwtSecret
      );
      
      // Check if refresh token exists in Redis
      const storedToken = await redisService.get(`refresh_token:${decoded.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Get user
    const user = await databaseService.findOne<UserRow>('users', { id: decoded.userId });
      if (!user || !user.is_active) {
        throw new AuthenticationError('User not found or inactive');
      }

      // Generate new tokens
      const newToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Update refresh token in Redis
      await redisService.set(`refresh_token:${user.id}`, newRefreshToken, 30 * 24 * 60 * 60);

      // Remove sensitive data
      const { password_hash, ...userResponse } = user as any;

      res.json({
        success: true,
        data: {
          user: userResponse,
          token: newToken,
          refreshToken: newRefreshToken,
          expiresIn: 7 * 24 * 60 * 60,
        },
      });
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  })
);

// Logout
router.post('/logout',
  authenticate,
  logout,
  asyncHandler(async (req: any, res: any) => {
    if (req.user) {
      // Remove refresh token
      await redisService.del(`refresh_token:${req.user.id}`);

      auditLog('user_logout', req.user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

// Get current user
router.get('/me',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const { password_hash, ...userResponse } = req.user as any;

    res.json({
      success: true,
      data: {
        user: userResponse,
      },
    });
  })
);

// Request password reset
router.post('/forgot-password',
  rateLimit,
  passwordResetValidation,
  checkValidation,
  asyncHandler(async (req: any, res: any) => {
    const { email } = req.body;

    const user = await databaseService.findOne<UserRow>('users', { email });
    if (!user) {
      // Don't reveal if user exists or not
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      });
      return;
    }

    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenHash = await hashPassword(resetToken);

    // Store reset token with expiration (1 hour)
    await databaseService.update('users', user.id, {
      reset_token_hash: resetTokenHash,
      reset_token_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    // TODO: Send email with reset link
    // For now, just log it
    logger.info('Password reset requested:', {
      userId: user.id,
      email: user.email,
      resetToken, // In production, this would be sent via email
    });

    auditLog('password_reset_requested', user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    });

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
    });
  })
);

// Reset password
router.post('/reset-password',
  rateLimit,
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must be at least 8 characters and contain uppercase, lowercase, number, and special character'),
  ],
  checkValidation,
  asyncHandler(async (req: any, res: any) => {
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await databaseService.findOne<UserRow>('users', {
      reset_token_expires_at: { $gt: new Date().toISOString() },
    });

    if (!user || !user.reset_token_hash) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    // Verify reset token
    const isValidToken = await comparePassword(token, user.reset_token_hash);
    if (!isValidToken) {
      throw new AuthenticationError('Invalid reset token');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await databaseService.update('users', user.id, {
      password_hash: newPasswordHash,
      reset_token_hash: null,
      reset_token_expires_at: null,
    });

    // Invalidate all refresh tokens
    await redisService.del(`refresh_token:${user.id}`);

    auditLog('password_reset_completed', user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  })
);

// Change password
router.post('/change-password',
  authenticate,
  rateLimit,
  passwordChangeValidation,
  checkValidation,
  asyncHandler(async (req: any, res: any) => {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, req.user.password_hash);
    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await databaseService.update('users', req.user.id, {
      password_hash: newPasswordHash,
    });

    // Invalidate all refresh tokens
    await redisService.del(`refresh_token:${req.user.id}`);

    auditLog('password_changed', req.user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  })
);

// Verify email
router.post('/verify-email',
  rateLimit,
  [
    body('token').notEmpty().withMessage('Verification token is required'),
  ],
  checkValidation,
  asyncHandler(async (req: any, res: any) => {
    const { token } = req.body;

    // Find user with verification token
    const user = await databaseService.findOne<UserRow>('users', {
      verification_token: token,
      is_verified: false,
    });

    if (!user) {
      throw new AuthenticationError('Invalid verification token');
    }

    // Verify email
    await databaseService.update('users', user.id, {
      is_verified: true,
      verification_token: null,
      email_verified_at: new Date().toISOString(),
    });

    auditLog('email_verified', user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  })
);

// Resend verification email
router.post('/resend-verification',
  authenticate,
  rateLimit,
  asyncHandler(async (req: any, res: any) => {
    if (req.user.is_verified) {
      throw new ValidationError('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = require('crypto').randomBytes(32).toString('hex');

    await databaseService.update('users', req.user.id, {
      verification_token: verificationToken,
    });

    // TODO: Send verification email
    logger.info('Verification email requested:', {
      userId: req.user.id,
      email: req.user.email,
      verificationToken, // In production, this would be sent via email
    });

    auditLog('verification_email_resent', req.user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    });

    res.json({
      success: true,
      message: 'Verification email sent',
    });
  })
);

export { router as authRoutes };
