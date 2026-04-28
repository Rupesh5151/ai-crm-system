/**
 * Activity Controller
 * Handles activity logging and timeline retrieval
 */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Activity, Lead } from '../models';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { CreateActivityInput } from '../validation/activitySchema';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leadId, type, page = '1', limit = '50' } = req.query;
    const query: Record<string, any> = {};
    if (leadId) query.leadId = leadId;
    if (type) query.type = type;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const [activities, total] = await Promise.all([
      Activity.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum)
        .populate('performedBy', 'name email avatar')
        .populate('leadId', 'name company').lean(),
      Activity.countDocuments(query),
    ]);

    paginatedResponse(res, activities, { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }, 'Activities retrieved successfully');
  } catch (error) {
    logger.error('Get activities error:', error);
    errorResponse(res, 'Failed to retrieve activities', 500, error);
  }
};

export const getLeadActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leadId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      errorResponse(res, 'Invalid lead ID', 400);
      return;
    }
    const lead = await Lead.findById(leadId);
    if (!lead || !lead.isActive) {
      errorResponse(res, 'Lead not found', 404);
      return;
    }
    const activities = await Activity.find({ leadId }).sort({ createdAt: -1 })
      .populate('performedBy', 'name email avatar').lean();
    successResponse(res, activities);
  } catch (error) {
    logger.error('Get lead activities error:', error);
    errorResponse(res, 'Failed to retrieve lead activities', 500, error);
  }
};

export const createActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const activityData = req.body as CreateActivityInput;
    const userId = (req as AuthenticatedRequest).user?.userId;

    if (!mongoose.Types.ObjectId.isValid(activityData.leadId)) {
      errorResponse(res, 'Invalid lead ID', 400);
      return;
    }
    const lead = await Lead.findById(activityData.leadId);
    if (!lead || !lead.isActive) {
      errorResponse(res, 'Lead not found', 404);
      return;
    }

    const activity = await Activity.create({ ...activityData, performedBy: userId });
    const populatedActivity = await Activity.findById(activity._id)
      .populate('performedBy', 'name email avatar')
      .populate('leadId', 'name company').lean();

    successResponse(res, populatedActivity, 'Activity logged successfully', 201);
  } catch (error) {
    logger.error('Create activity error:', error);
    errorResponse(res, 'Failed to create activity', 500, error);
  }
};

export const updateActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, metadata } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      errorResponse(res, 'Invalid activity ID', 400);
      return;
    }
    const activity = await Activity.findByIdAndUpdate(id, { title, description, metadata }, { new: true, runValidators: true })
      .populate('performedBy', 'name email avatar')
      .populate('leadId', 'name company');
    if (!activity) {
      errorResponse(res, 'Activity not found', 404);
      return;
    }
    successResponse(res, activity, 'Activity updated successfully');
  } catch (error) {
    logger.error('Update activity error:', error);
    errorResponse(res, 'Failed to update activity', 500, error);
  }
};

export const deleteActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      errorResponse(res, 'Invalid activity ID', 400);
      return;
    }
    const activity = await Activity.findByIdAndDelete(id);
    if (!activity) {
      errorResponse(res, 'Activity not found', 404);
      return;
    }
    successResponse(res, null, 'Activity deleted successfully');
  } catch (error) {
    logger.error('Delete activity error:', error);
    errorResponse(res, 'Failed to delete activity', 500, error);
  }
};

