/**
 * Core TypeScript Types and Interfaces
 * Shared across the backend application
 */
import { Request } from 'express';

export type UserRole = 'admin' | 'sales_rep';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

export type LeadSource = 'linkedin' | 'ads' | 'referral' | 'website' | 'email' | 'event' | 'cold_call' | 'other';

export type Industry = 'technology' | 'healthcare' | 'finance' | 'retail' | 'manufacturing' | 'education' | 'other';

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export type ScoreLabel = 'high' | 'medium' | 'low';

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'status_change';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  title?: string;
  industry?: Industry;
  companySize?: CompanySize;
  source: LeadSource;
  status: LeadStatus;
  score?: number;
  scoreLabel?: ScoreLabel;
  interactionCount: number;
  emailOpenRate: number;
  estimatedValue?: number;
  assignedTo?: string | IUser;
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivity {
  _id: string;
  leadId: string | ILead;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: {
    duration?: number;
    emailSubject?: string;
    emailOpened?: boolean;
    meetingLocation?: string;
  };
  performedBy: string | IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailTemplate {
  _id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'follow_up' | 'proposal' | 'reminder';
  variables: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponseData {
  success: boolean;
  message?: string;
  error?: string;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  industry?: Industry;
  assignedTo?: string;
  scoreLabel?: ScoreLabel;
  search?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

