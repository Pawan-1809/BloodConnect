const globalBuckets = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function createRateLimiter({ windowMs, max, message, keyGenerator }) {
  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator(req);
    const current = globalBuckets.get(key);

    if (!current || current.expiresAt <= now) {
      globalBuckets.set(key, {
        count: 1,
        expiresAt: now + windowMs
      });
      return next();
    }

    if (current.count >= max) {
      const retryAfter = Math.ceil((current.expiresAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      return res.status(429).json({
        success: false,
        message
      });
    }

    current.count += 1;
    return next();
  };
}

function sanitizeNoSqlOperators(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeNoSqlOperators);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const safe = {};
  Object.keys(value).forEach((key) => {
    if (key.startsWith('$') || key.includes('.')) {
      return;
    }
    safe[key] = sanitizeNoSqlOperators(value[key]);
  });

  return safe;
}

const sanitizeRequest = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeNoSqlOperators(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeNoSqlOperators(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeNoSqlOperators(req.params);
  }
  next();
};

const preventHttpParameterPollution = (whitelist = []) => (req, res, next) => {
  Object.keys(req.query || {}).forEach((key) => {
    const value = req.query[key];
    if (Array.isArray(value) && !whitelist.includes(key)) {
      req.query[key] = value[value.length - 1];
    }
  });
  next();
};

const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: 'Too many API requests. Please try again in a few minutes.',
  keyGenerator: (req) => `api:${getClientIp(req)}`
});

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts. Please wait before trying again.',
  keyGenerator: (req) => `auth:${getClientIp(req)}`
});

const requestCreationRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 12,
  message: 'Too many blood requests submitted. Please wait before creating another request.',
  keyGenerator: (req) => {
    const identity = req.user?.id || getClientIp(req);
    return `request-create:${identity}`;
  }
});

module.exports = {
  apiRateLimiter,
  authRateLimiter,
  requestCreationRateLimiter,
  sanitizeRequest,
  preventHttpParameterPollution
};
