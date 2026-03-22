const DEFAULT_LOCAL_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const normalizeOrigin = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  return value.trim().replace(/\/+$/, '');
};

const splitOrigins = (value) => {
  if (!value || typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
};

const getAllowedOrigins = () => {
  const configuredOrigins = [
    ...splitOrigins(process.env.CLIENT_URLS),
    normalizeOrigin(process.env.CLIENT_URL)
  ].filter(Boolean);

  return Array.from(
    new Set([...configuredOrigins, ...DEFAULT_LOCAL_ORIGINS].filter(Boolean))
  );
};

const createCorsOriginValidator = () => {
  const allowedOrigins = getAllowedOrigins();

  return (origin, callback) => {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(
      new Error(
        `Origin ${origin} is not allowed by CORS. Allowed origins: ${allowedOrigins.join(', ')}`
      )
    );
  };
};

module.exports = {
  getAllowedOrigins,
  createCorsOriginValidator
};
