const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    user: req.user?.id,
    tenant: req.user?.tenant_id
  });

  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      user: req.user?.id,
      tenant: req.user?.tenant_id
    });
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = requestLogger;
