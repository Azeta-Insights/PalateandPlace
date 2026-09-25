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
} from '../apiHandler.js';

// Create Express application for Vercel Serverless Functions
const app = express();

// Parse JSON request bodies while preserving raw buffer on req.rawBody for HMAC verification
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

// Paystack payment endpoints (matches /api/paystack/* and /paystack/*)
app.all(['/api/paystack/initialize', '/paystack/initialize', '*/paystack/initialize'], handlePaystackInit);
app.all(['/api/paystack/verify', '/paystack/verify', '*/paystack/verify'], handlePaystackVerify);
app.all(['/api/paystack/webhook', '/paystack/webhook', '*/paystack/webhook'], handlePaystackWebhook);

// AI Chef endpoints
app.post(['/api/ai/ask-chef', '/ai/ask-chef', '/api/ask-chef', '/ask-chef', '*/ask-chef'], handleAskChef);
app.post(['/api/chef/smart-search', '/chef/smart-search', '*/smart-search'], handleSmartSearch);

// Recipe endpoints
app.get(['/api/recipes', '/recipes', '*/recipes'], handleGetRecipe);
app.post(['/api/recipes/download-batch', '/recipes/download-batch', '*/download-batch'], handleDownloadBatch);

// User entitlement & insights endpoints
app.get(['/api/entitlements', '/entitlements', '*/entitlements'], handleGetEntitlement);
app.get(['/api/recipe-insights', '/recipe-insights', '*/recipe-insights'], handleGetRecipeInsights);

// Admin Console protected endpoints
app.post(['/api/admin/request-test-premium', '/admin/request-test-premium', '*/request-test-premium'], handleRequestTestPremium);
app.post(['/api/admin/approve-test-premium', '/admin/approve-test-premium', '*/approve-test-premium'], handleApproveTestPremium);
app.post(['/api/admin/revoke-test-premium', '/admin/revoke-test-premium', '*/revoke-test-premium'], handleRevokeTestPremium);
app.get(['/api/admin/overview', '/admin/overview', '*/admin/overview'], handleAdminOverview);
app.post(['/api/admin/dev-grant-premium', '/admin/dev-grant-premium', '*/dev-grant-premium'], handleDevGrantPremium);

// Health check / API Discovery
app.get(['/', '/api', '/api/'], (_req, res) => {
  res.json({
    service: 'Palate and Place API',
    status: 'online',
    version: '2.0.0',
    endpoints: [
      '/api/paystack/initialize',
      '/api/paystack/verify',
      '/api/paystack/webhook',
      '/api/ai/ask-chef',
      '/api/recipes',
      '/api/entitlements',
      '/api/recipe-insights'
    ]
  });
});

// Fallback JSON 404 handler for any unmapped API calls
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl || req.url}`,
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl
  });
});

export default app;
