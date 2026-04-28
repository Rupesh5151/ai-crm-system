/**
 * Lead Controller
 * Handles CRUD operations, AI scoring, and lead management
 */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Lead, Activity } from '../models';
import { predictLeadScore } from '../utils/aiService';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { LeadFilters, PaginationOptions } from '../types';

/**
 * @desc    Get all leads with filtering, sorting, pagination
 * @route   GET /api/v1/leads
 * @access  Private
 */
export const getLeads = async (req: Request, res: Response) => {
  try {
    const {
      status,
      source,
      industry,
      assignedTo,
      scoreLabel,
      search,
      tags,
      dateFrom,
      dateTo,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter
    const filter: any = { isActive: true };

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (industry) filter.industry = industry;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (scoreLabel) filter.scoreLabel = scoreLabel;
    if (tags) filter.tags = { $in: (tags as string).split(',') };
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo as string);
    }
    if (search) {
      filter.$text = { $search: search as string };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('assignedTo', 'name email avatar')
        .lean(),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return successResponse(res, leads, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    return errorResponse(res, 'Failed to fetch leads', 500);
  }
};

/**
 * @desc    Get single lead by ID
 * @route   GET /api/v1/leads/:id
 * @access  Private
 */
export const getLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid lead ID', 400);
    }

    const lead = await Lead.findById(id)
      .populate('assignedTo', 'name email avatar')
      .lean();

    if (!lead || !lead.isActive) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead);
  } catch (error) {
    logger.error('Error fetching lead:', error);
    return errorResponse(res, 'Failed to fetch lead', 500);
  }
};

/**
 * @desc    Create new lead with AI scoring
 * @route   POST /api/v1/leads
 * @access  Private
 */
export const createLead = async (req: Request, res: Response) => {
  try {
    const leadData = req.body;

    // Create lead first (without score)
    const lead = await Lead.create({
      ...leadData,
      assignedTo: leadData.assignedTo || req.user?.userId,
    });

    // Get AI score in background (don't block response)
    try {
      const features = {
        industry: lead.industry || 'other',
        company_size: lead.companySize || '1-10',
        source: lead.source,
        interaction_count: lead.interactionCount || 0,
        email_open_rate: lead.emailOpenRate || 0,
        days_since_creation: 0,
      };

      const aiResult = await predictLeadScore(features);

      // Update lead with score
      lead.score = aiResult.score;
      lead.scoreLabel = aiResult.label;
      await lead.save();

      logger.info(`AI Score for lead ${lead._id}: ${aiResult.score} (${aiResult.label})`);
    } catch (aiError) {
      logger.warn('AI scoring failed for new lead, continuing without score:', aiError);
    }

    // Log activity
    await Activity.create({
      leadId: lead._id,
      type: 'note',
      title: 'Lead created',
      description: `Lead created via ${lead.source}`,
      performedBy: req.user?.userId,
    });

    return successResponse(res, lead, undefined, 'Lead created successfully', 201);
  } catch (error: any) {
    logger.error('Error creating lead:', error);
    if (error.name === 'ValidationError') {
      return errorResponse(res, Object.values(error.errors).map((e: any) => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Failed to create lead', 500);
  }
};

/**
 * @desc    Update lead
 * @route   PATCH /api/v1/leads/:id
 * @access  Private
 */
export const updateLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid lead ID', 400);
    }

    const updates = req.body;
    delete updates.isActive; // Prevent reactivating via update

    const lead = await Lead.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email avatar');

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    // Log status change if applicable
    if (updates.status) {
      await Activity.create({
        leadId: lead._id,
        type: 'status_change',
        title: `Status changed to ${updates.status}`,
        description: `Lead status updated from pipeline`,
        performedBy: req.user?.userId,
      });
    }

    return successResponse(res, lead, undefined, 'Lead updated successfully');
  } catch (error: any) {
    logger.error('Error updating lead:', error);
    if (error.name === 'ValidationError') {
      return errorResponse(res, Object.values(error.errors).map((e: any) => e.message).join(', '), 400);
    }
    return errorResponse(res, 'Failed to update lead', 500);
  }
};

/**
 * @desc    Update lead status (for Kanban drag-drop)
 * @route   PATCH /api/v1/leads/:id/status
 * @access  Private
 */
export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid lead ID', 400);
    }

    const validStatuses = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status value', 400);
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!lead || !lead.isActive) {
      return errorResponse(res, 'Lead not found', 404);
    }

    // Log activity
    await Activity.create({
      leadId: lead._id,
      type: 'status_change',
      title: `Moved to ${status}`,
      description: `Lead moved to ${status} stage via pipeline`,
      performedBy: req.user?.userId,
    });

    return successResponse(res, lead, undefined, 'Status updated successfully');
  } catch (error) {
    logger.error('Error updating lead status:', error);
    return errorResponse(res, 'Failed to update status', 500);
  }
};

/**
 * @desc    Delete lead (soft delete)
 * @route   DELETE /api/v1/leads/:id
 * @access  Private (Admin only)
 */
export const deleteLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid lead ID', 400);
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, null, undefined, 'Lead deleted successfully');
  } catch (error) {
    logger.error('Error deleting lead:', error);
    return errorResponse(res, 'Failed to delete lead', 500);
  }
};

/**
 * @desc    Recalculate AI score for lead
 * @route   POST /api/v1/leads/:id/score
 * @access  Private
 */
export const recalculateScore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid lead ID', 400);
    }

    const lead = await Lead.findById(id);

    if (!lead || !lead.isActive) {
      return errorResponse(res, 'Lead not found', 404);
    }

    const daysSinceCreation = Math.floor(
      (Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const features = {
      industry: lead.industry || 'other',
      company_size: lead.companySize || '1-10',
      source: lead.source,
      interaction_count: lead.interactionCount || 0,
      email_open_rate: lead.emailOpenRate || 0,
      days_since_creation: daysSinceCreation,
    };

    const aiResult = await predictLeadScore(features);

    lead.score = aiResult.score;
    lead.scoreLabel = aiResult.label;
    await lead.save();

    return successResponse(res, {
      score: aiResult.score,
      label: aiResult.label,
      probability: aiResult.probability,
    }, undefined, 'Score recalculated successfully');
  } catch (error) {
    logger.error('Error recalculating score:', error);
    return errorResponse(res, 'Failed to recalculate score', 500);
  }
};

