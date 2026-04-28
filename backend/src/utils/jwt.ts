/**
 * JWT Utility Functions
 * Handles token generation and verification
 */
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_ACCESS_EXPIRATION, JWT_REFRESH_EXPIRATION } from '../config/env';
import { JwtPayload } from '../types';

export const generateTokens = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRATION as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRATION as jwt.SignOptions['expiresIn'],
    }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRATION as jwt.SignOptions['expiresIn'],
  });
};

