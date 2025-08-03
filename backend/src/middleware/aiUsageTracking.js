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
    
    console.log('AI Usage:', usage);
    
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
