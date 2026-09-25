import express from 'express';
import {
  handleAskChef,
  handleSmartSearch,
  handleGetRecipe,
  handlePaystackInit,
  handlePaystackVerify,
  handlePaystackWebhook,
  handleDownloadBatch,
  handleGetEntitlement,
  handleGetRecipeInsights,
  handleRequestTestPremium,
  handleApproveTestPremium,
  handleRevokeTestPremium,
  handleAdminOverview,
  handleDevGrantPremium
} from '../apiHandler';

// Create Express application for Vercel Serverless Functions
const app = express();

// Parse JSON request bodies while preserving the raw buffer on req.rawBody for HMAC verification
app.use(
  express.json({
    verify: (req: any, _res, buf: Buffer) => {
      req.rawBody = buf;
    }
  })
);

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, x-paystack-signature'
  );
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Configure API router
const router = express.Router();

// AI Chef endpoints
router.post('/ai/ask-chef', handleAskChef);
router.post('/ask-chef', handleAskChef);
router.post('/chef/smart-search', handleSmartSearch);

// Recipe endpoints
router.get('/recipes', handleGetRecipe);
router.post('/recipes/download-batch', handleDownloadBatch);

// Paystack payment endpoints
router.post('/paystack/initialize', handlePaystackInit);
router.get('/paystack/verify', handlePaystackVerify);
router.post('/paystack/webhook', handlePaystackWebhook);

// User entitlement & insights endpoints
router.get('/entitlements', handleGetEntitlement);
router.get('/recipe-insights', handleGetRecipeInsights);

// Admin Console protected endpoints
router.post('/admin/request-test-premium', handleRequestTestPremium);
router.post('/admin/approve-test-premium', handleApproveTestPremium);
router.post('/admin/revoke-test-premium', handleRevokeTestPremium);
router.get('/admin/overview', handleAdminOverview);
router.post('/admin/dev-grant-premium', handleDevGrantPremium);

// API Status & discovery
router.get('/', (_req, res) => {
  res.json({
    service: 'Palate and Place API',
    status: 'online',
    version: '2.0.0',
    endpoints: [
      '/api/ai/ask-chef',
      '/api/recipes',
      '/api/paystack/initialize',
      '/api/paystack/verify',
      '/api/paystack/webhook',
      '/api/entitlements',
      '/api/recipe-insights',
      '/api/admin/overview'
    ]
  });
});

// Mount router under both /api and / to seamlessly handle Vercel rewrites and direct calls
app.use('/api', router);
app.use('/', router);

export default app;
