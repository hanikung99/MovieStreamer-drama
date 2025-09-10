import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/connection';
import { users, userSessions, userProfiles } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiration,
  generateSecureToken,
  isValidEmail,
  isValidPassword,
  isValidUsername,
  extractDeviceInfo,
  TokenPayload
} from '../auth/utils';
import {
  authenticateToken,
  authRateLimit,
  strictRateLimit,
  validateUserStatus
} from '../auth/middleware';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().max(100).optional(),
});

const loginSchema = z.object({
  identifier: z.string(), // username or email
  password: z.string(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

// Register new user
router.post('/register', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { username, email, password, displayName } = registerSchema.parse(req.body);

    // Validate input
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    const usernameValidation = isValidUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({
        error: 'Invalid username',
        code: 'INVALID_USERNAME',
        details: usernameValidation.errors
      });
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        code: 'WEAK_PASSWORD',
        details: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash,
        displayName: displayName || username,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        createdAt: users.createdAt
      });

    // Create user profile
    await db.insert(userProfiles).values({
      userId: newUser[0].id,
      preferences: {
        autoplay: true,
        quality: '1080p',
        subtitles: false,
        notifications: {
          email: true,
          push: true,
          newMovies: true,
          recommendations: true
        },
        privacy: {
          showProfile: true,
          showFavorites: true,
          showWatchHistory: false
        }
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser[0]
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors
      });
    }

    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// Login user
router.post('/login', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { identifier, password } = loginSchema.parse(req.body);

    // Find user by username or email
    const user = await db
      .select()
      .from(users)
      .where(or(eq(users.username, identifier), eq(users.email, identifier)))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const userData = user[0];

    // Check if user is active
    if (!userData.isActive) {
      return res.status(403).json({
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, userData.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Extract device info
    const userAgent = req.headers['user-agent'] || '';
    const deviceInfo = extractDeviceInfo(userAgent);
    const ipAddress = req.ip || req.connection.remoteAddress || '';

    // Create session
    const session = await db
      .insert(userSessions)
      .values({
        userId: userData.id,
        token: accessToken,
        refreshToken,
        deviceInfo: JSON.stringify(deviceInfo),
        ipAddress,
        expiresAt: getTokenExpiration(process.env.JWT_EXPIRES_IN || '15m')
      })
      .returning({ id: userSessions.id });

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userData.id));

    res.json({
      message: 'Login successful',
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        avatar: userData.avatar,
        role: userData.role,
        isVerified: userData.isVerified
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      },
      sessionId: session[0].id
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors
      });
    }

    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// Refresh token
router.post('/refresh', strictRateLimit, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(403).json({
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Find session
    const session = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.refreshToken, refreshToken),
          eq(userSessions.isActive, true)
        )
      )
      .limit(1);

    if (session.length === 0) {
      return res.status(403).json({
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    // Check if session is expired
    if (new Date() > session[0].expiresAt) {
      await db
        .update(userSessions)
        .set({ isActive: false })
        .where(eq(userSessions.id, session[0].id));

      return res.status(403).json({
        error: 'Session expired',
        code: 'SESSION_EXPIRED'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Update session
    await db
      .update(userSessions)
      .set({
        token: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: getTokenExpiration(process.env.JWT_EXPIRES_IN || '15m'),
        lastUsedAt: new Date()
      })
      .where(eq(userSessions.id, session[0].id));

    res.json({
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors
      });
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      code: 'REFRESH_ERROR'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user?.sessionId) {
      return res.status(400).json({
        error: 'No active session',
        code: 'NO_SESSION'
      });
    }

    // Deactivate session
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.id, req.user.sessionId));

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

// Logout all sessions
router.post('/logout-all', authenticateToken, validateUserStatus, async (req: Request, res: Response) => {
  try {
    // Deactivate all user sessions
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, req.user!.userId));

    res.json({
      message: 'All sessions logged out successfully'
    });

  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      error: 'Logout all failed',
      code: 'LOGOUT_ALL_ERROR'
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, validateUserStatus, async (req: Request, res: Response) => {
  try {
    const user = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        avatar: users.avatar,
        role: users.role,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        profile: {
          bio: userProfiles.bio,
          country: userProfiles.country,
          language: userProfiles.language,
          preferences: userProfiles.preferences,
          totalWatchTime: userProfiles.totalWatchTime,
          moviesWatched: userProfiles.moviesWatched,
          favoriteGenres: userProfiles.favoriteGenres
        }
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, req.user!.userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      user: user[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      code: 'PROFILE_ERROR'
    });
  }
});

// Change password
router.post('/change-password', authenticateToken, validateUserStatus, authRateLimit, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    // Validate new password
    const passwordValidation = isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'New password does not meet requirements',
        code: 'WEAK_PASSWORD',
        details: passwordValidation.errors
      });
    }

    // Get current user
    const user = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, req.user!.userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify current password
    const isValidCurrentPassword = await verifyPassword(currentPassword, user[0].passwordHash);
    if (!isValidCurrentPassword) {
      return res.status(401).json({
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await db
      .update(users)
      .set({ 
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.user!.userId));

    // Invalidate all other sessions (keep current session active)
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(
        and(
          eq(userSessions.userId, req.user!.userId),
          eq(userSessions.id, req.user!.sessionId!)
        )
      );

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors
      });
    }

    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password change failed',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

// Get active sessions
router.get('/sessions', authenticateToken, validateUserStatus, async (req: Request, res: Response) => {
  try {
    const sessions = await db
      .select({
        id: userSessions.id,
        deviceInfo: userSessions.deviceInfo,
        ipAddress: userSessions.ipAddress,
        createdAt: userSessions.createdAt,
        lastUsedAt: userSessions.lastUsedAt,
        expiresAt: userSessions.expiresAt,
        isCurrent: userSessions.id
      })
      .from(userSessions)
      .where(
        and(
          eq(userSessions.userId, req.user!.userId),
          eq(userSessions.isActive, true)
        )
      )
      .orderBy(userSessions.lastUsedAt);

    // Mark current session
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: session.id === req.user!.sessionId,
      deviceInfo: session.deviceInfo ? JSON.parse(session.deviceInfo) : null
    }));

    res.json({
      sessions: sessionsWithCurrent
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      error: 'Failed to get sessions',
      code: 'SESSIONS_ERROR'
    });
  }
});

// Revoke specific session
router.delete('/sessions/:sessionId', authenticateToken, validateUserStatus, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    // Don't allow revoking current session
    if (sessionId === req.user!.sessionId) {
      return res.status(400).json({
        error: 'Cannot revoke current session',
        code: 'CANNOT_REVOKE_CURRENT'
      });
    }

    // Revoke session
    const result = await db
      .update(userSessions)
      .set({ isActive: false })
      .where(
        and(
          eq(userSessions.id, sessionId),
          eq(userSessions.userId, req.user!.userId)
        )
      )
      .returning({ id: userSessions.id });

    if (result.length === 0) {
      return res.status(404).json({
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    res.json({
      message: 'Session revoked successfully'
    });

  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      error: 'Failed to revoke session',
      code: 'REVOKE_SESSION_ERROR'
    });
  }
});

export default router;
