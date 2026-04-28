/**
 * Authentication Controller
 * Handles user registration, login, and token refresh
 */
import { Request, Response } from 'express';
import { User } from '../models';
import { generateTokens, generateAccessToken, verifyToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/response';
import { RegisterInput, LoginInput } from '../validation/authSchema';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as RegisterInput;

    const existingUser = await User.findOne({ email, isActive: true });
    if (existingUser) {
      errorResponse(res, 'Email already registered', 409);
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'sales_rep',
    });

    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    successResponse(
      res,
      {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        ...tokens,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    logger.error('Register error:', error);
    errorResponse(res, 'Registration failed', 500, error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;

    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user) {
      errorResponse(res, 'Invalid email or password', 401);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      errorResponse(res, 'Invalid email or password', 401);
      return;
    }

    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    successResponse(res, {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    });
  } catch (error) {
    logger.error('Login error:', error);
    errorResponse(res, 'Login failed', 500, error);
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      errorResponse(res, 'Refresh token required', 400);
      return;
    }

    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      errorResponse(res, 'User not found or inactive', 401);
      return;
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    successResponse(res, { accessToken });
  } catch (error) {
    logger.error('Refresh token error:', error);
    errorResponse(res, 'Invalid refresh token', 401);
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.userId;
    const user = await User.findById(userId).select('-password');
    if (!user || !user.isActive) {
      errorResponse(res, 'User not found', 404);
      return;
    }
    successResponse(res, user);
  } catch (error) {
    logger.error('Get me error:', error);
    errorResponse(res, 'Failed to get user', 500, error);
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.userId;
    const { name, email } = req.body;

    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        errorResponse(res, 'Email already in use', 409);
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    logger.error('Update me error:', error);
    errorResponse(res, 'Failed to update profile', 500, error);
  }
};
