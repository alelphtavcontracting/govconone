const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id,
    tenant: req.user?.tenant_id
  });

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: isDevelopment ? err.message : 'Invalid input data'
    });
  }

  if (err.name === 'UnauthorizedError' || err.message.includes('token')) {
    return res.status(401).json({
      error: 'Authentication failed',
      details: isDevelopment ? err.message : 'Invalid or expired token'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Access denied',
      details: isDevelopment ? err.message : 'Insufficient permissions'
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    details: isDevelopment ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler;
