"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authMiddleware_1 = require("@middleware/authMiddleware");
const DatabaseService_1 = require("@services/DatabaseService");
const RedisService_1 = require("@services/RedisService");
const logger_1 = require("@utils/logger");
const errorHandler_1 = require("@middleware/errorHandler");
const authMiddleware_2 = require("@middleware/authMiddleware");
const router = (0, express_1.Router)();
exports.authRoutes = router;
const registerValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('username')
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'),
    (0, express_validator_1.body)('firstName')
        .isLength({ min: 1, max: 50 })
        .trim()
        .withMessage('First name is required and must be less than 50 characters'),
    (0, express_validator_1.body)('lastName')
        .isLength({ min: 1, max: 50 })
        .trim()
        .withMessage('Last name is required and must be less than 50 characters'),
];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
];
const passwordResetValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
];
const passwordChangeValidation = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must be at least 8 characters and contain uppercase, lowercase, number, and special character'),
];
const checkValidation = (req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.ValidationError('Validation failed', errors.array());
    }
    next();
};
router.post('/register', authMiddleware_2.rateLimit, registerValidation, checkValidation, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, username, password, firstName, lastName } = req.body;
    const existingUser = await DatabaseService_1.databaseService.findOne('users', { email });
    if (existingUser) {
        throw new errorHandler_1.ConflictError('User with this email already exists');
    }
    const existingUsername = await DatabaseService_1.databaseService.findOne('users', { username });
    if (existingUsername) {
        throw new errorHandler_1.ConflictError('Username already taken');
    }
    const hashedPassword = await (0, authMiddleware_1.hashPassword)(password);
    const user = await DatabaseService_1.databaseService.insert('users', {
        email,
        username,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        is_verified: false,
        is_active: true,
        role: 'user',
    });
    const token = (0, authMiddleware_1.generateToken)({
        userId: user.id,
        email: user.email,
        role: user.role,
    });
    const refreshToken = (0, authMiddleware_1.generateRefreshToken)({
        userId: user.id,
        email: user.email,
        role: user.role,
    });
    await RedisService_1.redisService.set(`refresh_token:${user.id}`, refreshToken, 30 * 24 * 60 * 60);
    (0, logger_1.auditLog)('user_registered', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
    });
    const { password_hash, ...userResponse } = user;
    res.status(201).json({
        success: true,
        data: {
            user: userResponse,
            token,
            refreshToken,
            expiresIn: 7 * 24 * 60 * 60,
        },
    });
}));
router.post('/login', authMiddleware_2.rateLimit, loginValidation, checkValidation, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await DatabaseService_1.databaseService.findOne('users', { email });
    if (!user) {
        (0, logger_1.auditLog)('login_failed', undefined, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            email,
            reason: 'User not found',
            success: false,
        });
        throw new errorHandler_1.AuthenticationError('Invalid email or password');
    }
    if (!user.is_active) {
        (0, logger_1.auditLog)('login_failed', user.id, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            reason: 'Account inactive',
            success: false,
        });
        throw new errorHandler_1.AuthenticationError('Account is deactivated');
    }
    const isValidPassword = await (0, authMiddleware_1.comparePassword)(password, user.password_hash);
    if (!isValidPassword) {
        (0, logger_1.auditLog)('login_failed', user.id, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            reason: 'Invalid password',
            success: false,
        });
        throw new errorHandler_1.AuthenticationError('Invalid email or password');
    }
    const token = (0, authMiddleware_1.generateToken)({
        userId: user.id,
        email: user.email,
        role: user.role,
    });
    const refreshToken = (0, authMiddleware_1.generateRefreshToken)({
        userId: user.id,
        email: user.email,
        role: user.role,
    });
    await RedisService_1.redisService.set(`refresh_token:${user.id}`, refreshToken, 30 * 24 * 60 * 60);
    await DatabaseService_1.databaseService.update('users', user.id, {
        last_login_at: new Date().toISOString(),
    });
    (0, logger_1.auditLog)('user_login', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
    });
    const { password_hash, ...userResponse } = user;
    res.json({
        success: true,
        data: {
            user: userResponse,
            token,
            refreshToken,
            expiresIn: 7 * 24 * 60 * 60,
        },
    });
}));
router.post('/refresh', authMiddleware_2.rateLimit, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new errorHandler_1.ValidationError('Refresh token is required');
    }
    try {
        const decoded = require('jsonwebtoken').verify(refreshToken, process.env['JWT_SECRET']);
        const storedToken = await RedisService_1.redisService.get(`refresh_token:${decoded.userId}`);
        if (!storedToken || storedToken !== refreshToken) {
            throw new errorHandler_1.AuthenticationError('Invalid refresh token');
        }
        const user = await DatabaseService_1.databaseService.findOne('users', { id: decoded.userId });
        if (!user || !user.is_active) {
            throw new errorHandler_1.AuthenticationError('User not found or inactive');
        }
        const newToken = (0, authMiddleware_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const newRefreshToken = (0, authMiddleware_1.generateRefreshToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        await RedisService_1.redisService.set(`refresh_token:${user.id}`, newRefreshToken, 30 * 24 * 60 * 60);
        const { password_hash, ...userResponse } = user;
        res.json({
            success: true,
            data: {
                user: userResponse,
                token: newToken,
                refreshToken: newRefreshToken,
                expiresIn: 7 * 24 * 60 * 60,
            },
        });
    }
    catch (error) {
        throw new errorHandler_1.AuthenticationError('Invalid refresh token');
    }
}));
router.post('/logout', authMiddleware_1.authenticate, authMiddleware_1.logout, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user) {
        await RedisService_1.redisService.del(`refresh_token:${req.user.id}`);
        (0, logger_1.auditLog)('user_logout', req.user.id, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            success: true,
        });
    }
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
}));
router.get('/me', authMiddleware_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { password_hash, ...userResponse } = req.user;
    res.json({
        success: true,
        data: {
            user: userResponse,
        },
    });
}));
router.post('/forgot-password', authMiddleware_2.rateLimit, passwordResetValidation, checkValidation, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const user = await DatabaseService_1.databaseService.findOne('users', { email });
    if (!user) {
        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent',
        });
        return;
    }
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenHash = await (0, authMiddleware_1.hashPassword)(resetToken);
    await DatabaseService_1.databaseService.update('users', user.id, {
        reset_token_hash: resetTokenHash,
        reset_token_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
    logger_1.logger.info('Password reset requested:', {
        userId: user.id,
        email: user.email,
        resetToken,
    });
    (0, logger_1.auditLog)('password_reset_requested', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
    });
    res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
    });
}));
router.post('/reset-password', authMiddleware_2.rateLimit, [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Reset token is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must be at least 8 characters and contain uppercase, lowercase, number, and special character'),
], checkValidation, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token, newPassword } = req.body;
    const user = await DatabaseService_1.databaseService.findOne('users', {
        reset_token_expires_at: { $gt: new Date().toISOString() },
    });
    if (!user || !user.reset_token_hash) {
        throw new errorHandler_1.AuthenticationError('Invalid or expired reset token');
    }
    const isValidToken = await (0, authMiddleware_1.comparePassword)(token, user.reset_token_hash);
    if (!isValidToken) {
        throw new errorHandler_1.AuthenticationError('Invalid reset token');
    }
    const newPasswordHash = await (0, authMiddleware_1.hashPassword)(newPassword);
    await DatabaseService_1.databaseService.update('users', user.id, {
        password_hash: newPasswordHash,
        reset_token_hash: null,
        reset_token_expires_at: null,
    });
    await RedisService_1.redisService.del(`refresh_token:${user.id}`);
    (0, logger_1.auditLog)('password_reset_completed', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
    });
    res.json({
        success: true,
        message: 'Password reset successfully',
    });
}));
router.post('/change-password', authMiddleware_1.authenticate, authMiddleware_2.rateLimit, passwordChangeValidation, checkValidation, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const isValidPassword = await (0, authMiddleware_1.comparePassword)(currentPassword, req.user.password_hash);
    if (!isValidPassword) {
        throw new errorHandler_1.AuthenticationError('Current password is incorrect');
    }
    const newPasswordHash = await (0, authMiddleware_1.hashPassword)(newPassword);
    await DatabaseService_1.databaseService.update('users', req.user.id, {
        password_hash: newPasswordHash,
    });
    await RedisService_1.redisService.del(`refresh_token:${req.user.id}`);
    (0, logger_1.auditLog)('password_changed', req.user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
    });
    res.json({
        success: true,
        message: 'Password changed successfully',
    });
}));
router.post('/verify-email', authMiddleware_2.rateLimit, [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Verification token is required'),
], checkValidation, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.body;
    const user = await DatabaseService_1.databaseService.findOne('users', {
        verification_token: token,
        is_verified: false,
    });
    if (!user) {
        throw new errorHandler_1.AuthenticationError('Invalid verification token');
    }
    await DatabaseService_1.databaseService.update('users', user.id, {
        is_verified: true,
        verification_token: null,
        email_verified_at: new Date().toISOString(),
    });
    (0, logger_1.auditLog)('email_verified', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
    });
    res.json({
        success: true,
        message: 'Email verified successfully',
    });
}));
router.post('/resend-verification', authMiddleware_1.authenticate, authMiddleware_2.rateLimit, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user.is_verified) {
        throw new errorHandler_1.ValidationError('Email is already verified');
    }
    const verificationToken = require('crypto').randomBytes(32).toString('hex');
    await DatabaseService_1.databaseService.update('users', req.user.id, {
        verification_token: verificationToken,
    });
    logger_1.logger.info('Verification email requested:', {
        userId: req.user.id,
        email: req.user.email,
        verificationToken,
    });
    (0, logger_1.auditLog)('verification_email_resent', req.user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
    });
    res.json({
        success: true,
        message: 'Verification email sent',
    });
}));
//# sourceMappingURL=authRoutes.js.map