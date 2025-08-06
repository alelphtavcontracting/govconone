const db = require('../database/connection');
const logger = require('../utils/logger');

const aiUsageTracking = async (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const usage = {
      tenant_id: req.user?.tenant_id,
      user_id: req.user?.id,
      endpoint: req.path,
      method: req.method,
      duration: duration,
      timestamp: new Date().toISOString(),
      tier: req.user?.tier || 'free'
    };
    
    if (req.aiUsage) {
      usage.tokens_used = req.aiUsage.tokens;
      usage.model_used = req.aiUsage.model;
      usage.cost_estimate = req.aiUsage.cost;
    }
    
    logger.info('AI Usage', usage);
    
    if (req.user?.tenant_id && req.user.tenant_id !== 'demo-tenant' && req.aiUsage) {
      setImmediate(async () => {
        try {
          await db.query(
            `INSERT INTO ai_usage_logs (tenant_id, user_id, endpoint, method, model_used, tokens_used, cost_estimate, duration_ms, request_data, response_data)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              req.user.tenant_id,
              req.user.id,
              req.path,
              req.method,
              req.aiUsage.model,
              req.aiUsage.tokens,
              req.aiUsage.cost,
              duration,
              req.aiUsage.requestData || null,
              req.aiUsage.responseData || null
            ]
          );
        } catch (error) {
          logger.error('Failed to persist AI usage log', { error: error.message, usage });
        }
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

const trackAIUsage = (tokens, model, cost = 0) => {
  return (req, res, next) => {
    req.aiUsage = {
      tokens: tokens,
      model: model,
      cost: cost
    };
    next();
  };
};

module.exports = {
  aiUsageTracking,
  trackAIUsage
};
