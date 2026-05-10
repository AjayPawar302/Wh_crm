export function notFoundMiddleware(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

export function errorMiddleware(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const message = status >= 500 ? 'Internal server error' : err.message;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
}
