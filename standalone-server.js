/**
 * Standalone Demo Server
 * Lightweight Express server with in-memory storage
 * No MongoDB or Redis required - for demo purposes only
 */
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'demo-secret-key-for-testing-only';

// In-memory storage
const users = [];
const leads = [];
const activities = [];
let idCounter = { user: 1, lead: 1, activity: 1 };

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// AI Service client
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 5000,
  headers: { 'X-API-Key': 'dev-key' }
});

// Auth middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Helper
const success = (res, data, meta, message, code = 200) => {
  const response = { success: true, data };
  if (meta) response.meta = meta;
  if (message) response.message = message;
  res.status(code).json(response);
};

const error = (res, message, code = 500) => {
  res.status(code).json({ success: false, message });
};

// ========== AUTH ROUTES ==========
app.post('/api/v1/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return error(res, 'Email already exists', 409);
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: String(idCounter.user++),
    name,
    email,
    password: hashed,
    role: 'sales_rep',
    createdAt: new Date()
  };
  users.push(user);
  const token = jwt.sign({ userId: user.id, email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  const refresh = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  success(res, { user: { id: user.id, name, email, role: user.role }, accessToken: token, refreshToken: refresh }, null, 'Registered', 201);
});

app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return error(res, 'Invalid credentials', 401);
  }
  const token = jwt.sign({ userId: user.id, email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  const refresh = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  success(res, { user: { id: user.id, name: user.name, email, role: user.role }, accessToken: token, refreshToken: refresh });
});

app.get('/api/v1/auth/me', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) return error(res, 'User not found', 404);
  success(res, { id: user.id, name: user.name, email: user.email, role: user.role });
});

// ========== LEAD ROUTES ==========
app.get('/api/v1/leads', authenticate, (req, res) => {
  let result = leads.filter(l => l.isActive);
  if (req.query.status) result = result.filter(l => l.status === req.query.status);
  if (req.query.source) result = result.filter(l => l.source === req.query.source);
  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    result = result.filter(l => l.name.toLowerCase().includes(s) || l.email.toLowerCase().includes(s) || l.company.toLowerCase().includes(s));
  }
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '20');
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);
  success(res, paginated, { page, limit, total: result.length, totalPages: Math.ceil(result.length / limit) });
});

app.get('/api/v1/leads/:id', authenticate, (req, res) => {
  const lead = leads.find(l => l.id === req.params.id && l.isActive);
  if (!lead) return error(res, 'Lead not found', 404);
  success(res, lead);
});

app.post('/api/v1/leads', authenticate, async (req, res) => {
  const lead = {
    id: String(idCounter.lead++),
    ...req.body,
    score: null,
    scoreLabel: null,
    interactionCount: 0,
    emailOpenRate: 0,
    isActive: true,
    assignedTo: req.user.userId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Try AI scoring
  try {
    const features = {
      industry: lead.industry || 'other',
      company_size: lead.companySize || '1-10',
      source: lead.source,
      interaction_count: 0,
      email_open_rate: 0,
      days_since_creation: 0
    };
    const aiRes = await aiClient.post('/predict-score', features);
    lead.score = aiRes.data.score;
    lead.scoreLabel = aiRes.data.label;
  } catch (e) {
    console.log('AI service not available, using fallback');
    lead.score = 50;
    lead.scoreLabel = 'medium';
  }
  
  leads.push(lead);
  activities.push({
    id: String(idCounter.activity++),
    leadId: lead.id,
    type: 'note',
    title: 'Lead created',
    description: `Lead created via ${lead.source}`,
    performedBy: req.user.userId,
    createdAt: new Date()
  });
  success(res, lead, null, 'Lead created', 201);
});

app.patch('/api/v1/leads/:id', authenticate, (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) return error(res, 'Lead not found', 404);
  Object.assign(lead, req.body, { updatedAt: new Date() });
  if (req.body.status) {
    activities.push({
      id: String(idCounter.activity++),
      leadId: lead.id,
      type: 'status_change',
      title: `Status changed to ${req.body.status}`,
      performedBy: req.user.userId,
      createdAt: new Date()
    });
  }
  success(res, lead, null, 'Lead updated');
});

app.patch('/api/v1/leads/:id/status', authenticate, (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) return error(res, 'Lead not found', 404);
  lead.status = req.body.status;
  lead.updatedAt = new Date();
  activities.push({
    id: String(idCounter.activity++),
    leadId: lead.id,
    type: 'status_change',
    title: `Moved to ${req.body.status}`,
    description: 'Lead moved via pipeline',
    performedBy: req.user.userId,
    createdAt: new Date()
  });
  success(res, lead, null, 'Status updated');
});

app.delete('/api/v1/leads/:id', authenticate, (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) return error(res, 'Lead not found', 404);
  lead.isActive = false;
  success(res, null, null, 'Lead deleted');
});

app.post('/api/v1/leads/:id/score', authenticate, async (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) return error(res, 'Lead not found', 404);
  try {
    const daysSince = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const features = {
      industry: lead.industry || 'other',
      company_size: lead.companySize || '1-10',
      source: lead.source,
      interaction_count: lead.interactionCount || 0,
      email_open_rate: lead.emailOpenRate || 0,
      days_since_creation: daysSince
    };
    const aiRes = await aiClient.post('/predict-score', features);
    lead.score = aiRes.data.score;
    lead.scoreLabel = aiRes.data.label;
    success(res, aiRes.data, null, 'Score recalculated');
  } catch (e) {
    error(res, 'AI service unavailable', 503);
  }
});

// ========== ACTIVITY ROUTES ==========
app.get('/api/v1/activities', authenticate, (req, res) => {
  let result = [...activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  success(res, result);
});

app.get('/api/v1/activities/lead/:leadId', authenticate, (req, res) => {
  const result = activities
    .filter(a => a.leadId === req.params.leadId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  success(res, result);
});

app.post('/api/v1/activities', authenticate, (req, res) => {
  const activity = {
    id: String(idCounter.activity++),
    ...req.body,
    performedBy: req.user.userId,
    createdAt: new Date()
  };
  activities.push(activity);
  const lead = leads.find(l => l.id === req.body.leadId);
  if (lead && ['call', 'email', 'meeting'].includes(req.body.type)) {
    lead.interactionCount = (lead.interactionCount || 0) + 1;
  }
  success(res, activity, null, 'Activity logged', 201);
});

// ========== ANALYTICS ROUTES ==========
app.get('/api/v1/analytics/dashboard', authenticate, (req, res) => {
  const activeLeads = leads.filter(l => l.isActive);
  const wonLeads = activeLeads.filter(l => l.status === 'won');
  const totalRevenue = wonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const scored = activeLeads.filter(l => l.score !== null);
  const avgScore = scored.length ? Math.round(scored.reduce((s, l) => s + l.score, 0) / scored.length) : 0;
  
  success(res, {
    totalLeads: activeLeads.length,
    conversionRate: activeLeads.length ? Math.round((wonLeads.length / activeLeads.length) * 100) : 0,
    revenue: totalRevenue,
    avgScore,
    leadsGrowth: 12,
    recentActivities: activities.slice(-5).reverse().map(a => ({
      id: a.id,
      title: a.title,
      leadId: activeLeads.find(l => l.id === a.leadId) || { name: 'Unknown' },
      performedBy: users.find(u => u.id === a.performedBy) || { name: 'Unknown' },
      createdAt: a.createdAt
    }))
  });
});

app.get('/api/v1/analytics/pipeline', authenticate, (req, res) => {
  const statuses = ['new', 'contacted', 'qualified', 'proposal', 'won'];
  const result = statuses.map(status => ({
    status,
    count: leads.filter(l => l.isActive && l.status === status).length,
    totalValue: leads.filter(l => l.isActive && l.status === status).reduce((s, l) => s + (l.estimatedValue || 0), 0)
  }));
  success(res, result);
});

app.get('/api/v1/analytics/sources', authenticate, (req, res) => {
  const sources = {};
  leads.filter(l => l.isActive).forEach(l => {
    sources[l.source] = (sources[l.source] || 0) + 1;
  });
  success(res, Object.entries(sources).map(([source, count]) => ({ source, count })));
});

// Seed demo data
function seedData() {
  const demoUser = {
    id: '1',
    name: 'Demo User',
    email: 'demo@aicrm.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'admin',
    createdAt: new Date()
  };
  users.push(demoUser);

  const demoLeads = [
    { name: 'John Smith', email: 'john@techcorp.com', company: 'TechCorp', source: 'linkedin', status: 'qualified', industry: 'technology', companySize: '201-500', estimatedValue: 50000, score: 85, scoreLabel: 'high', interactionCount: 5 },
    { name: 'Sarah Johnson', email: 'sarah@healthplus.com', company: 'HealthPlus', source: 'referral', status: 'proposal', industry: 'healthcare', companySize: '51-200', estimatedValue: 75000, score: 92, scoreLabel: 'high', interactionCount: 8 },
    { name: 'Mike Chen', email: 'mike@finserve.com', company: 'FinServe', source: 'website', status: 'new', industry: 'finance', companySize: '500+', estimatedValue: 120000, score: 78, scoreLabel: 'high', interactionCount: 1 },
    { name: 'Emily Davis', email: 'emily@retailmax.com', company: 'RetailMax', source: 'ads', status: 'contacted', industry: 'retail', companySize: '11-50', estimatedValue: 25000, score: 45, scoreLabel: 'medium', interactionCount: 2 },
    { name: 'Robert Wilson', email: 'robert@manufact.co', company: 'ManufactCo', source: 'cold_call', status: 'lost', industry: 'manufacturing', companySize: '1-10', estimatedValue: 15000, score: 22, scoreLabel: 'low', interactionCount: 1 },
    { name: 'Lisa Anderson', email: 'lisa@edutech.com', company: 'EduTech', source: 'event', status: 'won', industry: 'education', companySize: '201-500', estimatedValue: 45000, score: 88, scoreLabel: 'high', interactionCount: 10 },
    { name: 'David Brown', email: 'david@startup.io', company: 'StartupIO', source: 'linkedin', status: 'qualified', industry: 'technology', companySize: '11-50', estimatedValue: 30000, score: 72, scoreLabel: 'high', interactionCount: 4 },
    { name: 'Amy Martinez', email: 'amy@globalbank.com', company: 'GlobalBank', source: 'referral', status: 'proposal', industry: 'finance', companySize: '500+', estimatedValue: 200000, score: 95, scoreLabel: 'high', interactionCount: 12 },
  ];

  demoLeads.forEach(l => {
    leads.push({
      id: String(idCounter.lead++),
      ...l,
      phone: '',
      title: '',
      notes: '',
      tags: [],
      emailOpenRate: Math.floor(Math.random() * 80) + 10,
      isActive: true,
      assignedTo: '1',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    });
  });

  console.log('✅ Demo data seeded:', users.length, 'users,', leads.length, 'leads');
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'standalone-demo' });
});

// Start
seedData();
app.listen(PORT, () => {
  console.log(`\n🚀 Standalone Demo Server running on http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/v1`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`👤 Demo login: demo@aicrm.com / password123\n`);
});

