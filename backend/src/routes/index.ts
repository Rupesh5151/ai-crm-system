/**
 * Routes Barrel Export
 * Aggregates all API routes
 */
import { Router } from 'express';
import authRoutes from './authRoutes';
import leadRoutes from './leadRoutes';
import activityRoutes from './activityRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/activities', activityRoutes);
router.use('/analytics', analyticsRoutes);

export default router;

