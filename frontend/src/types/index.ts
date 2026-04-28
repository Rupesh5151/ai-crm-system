export type UserRole = 'admin' | 'sales_rep';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

export type LeadSource = 'linkedin' | 'ads' | 'referral' | 'website' | 'email' | 'event' | 'cold_call' | 'other';

export type Industry = 'technology' | 'healthcare' | 'finance' | 'retail' | 'manufacturing' | 'education' | 'other';

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export type ScoreLabel = 'high' | 'medium' | 'low';

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'status_change';

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Lead {
  _id: string;
  id: string;
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
  assignedTo?: User;
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  id: string;
  leadId: string | Lead;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: {
    duration?: number;
    emailSubject?: string;
    emailOpened?: boolean;
    meetingLocation?: string;
  };
  performedBy: User;
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeadsThisMonth: number;
  wonLeads: number;
  lostLeads: number;
  revenue: number;
  conversionRate: number;
  avgScore: number;
  leadsGrowth: number;
  recentActivities: Activity[];
}

export interface PipelineStage {
  status: LeadStatus;
  count: number;
  totalValue: number;
}

export interface LeadSourceData {
  source: string;
  count: number;
  converted: number;
  conversionRate: string;
}

export interface FunnelStage {
  status: string;
  count: number;
}

export interface RevenueTrend {
  year: number;
  month: number;
  revenue: number;
  count: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

