/**
 * AI Service HTTP Client
 * Communicates with Python FastAPI microservice for lead scoring
 */
import axios, { AxiosInstance } from 'axios';
import { AI_SERVICE_URL, AI_SERVICE_API_KEY } from '../config/env';
import logger from './logger';

// Create axios instance with defaults
const aiClient: AxiosInstance = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    ...(AI_SERVICE_API_KEY && { 'X-API-Key': AI_SERVICE_API_KEY }),
  },
});

// Request interceptor for logging
aiClient.interceptors.request.use(
  (config) => {
    logger.debug(`AI Service Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for logging
aiClient.interceptors.response.use(
  (response) => {
    logger.debug(`AI Service Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    logger.error('AI Service Error:', error.message);
    return Promise.reject(error);
  }
);

interface LeadFeatures {
  industry: string;
  company_size: string;
  source: string;
  interaction_count: number;
  email_open_rate: number;
  days_since_creation?: number;
}

interface PredictScoreResponse {
  score: number;
  label: 'high' | 'medium' | 'low';
  probability: number;
}

export const predictLeadScore = async (features: LeadFeatures): Promise<PredictScoreResponse> => {
  try {
    const response = await aiClient.post('/predict-score', features);
    return response.data;
  } catch (error) {
    logger.error('Error calling AI service for lead scoring:', error);
    
    // Fallback: return a conservative score if AI service is unavailable
    return {
      score: 50,
      label: 'medium',
      probability: 0.5,
    };
  }
};

export const checkAiHealth = async (): Promise<boolean> => {
  try {
    const response = await aiClient.get('/health', { timeout: 3000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

export default aiClient;

