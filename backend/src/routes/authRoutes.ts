/**
 * Authentication Routes
 * /api/v1/auth
 */
import { Router } from 'express';
import { register, login, refresh, getMe, updateMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validation/authSchema';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshTokenSchema), refresh);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);

export default router;

