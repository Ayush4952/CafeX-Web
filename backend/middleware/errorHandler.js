export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(error, req, res, _next) {
  if (error.name === "ZodError") {
    return res.status(400).json({
      message: "Please check the submitted details",
      issues: error.issues?.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "That record already exists" });
  }
  const status = error.status ?? (error.name === "MulterError" ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({
    message: error.message ?? "Unexpected server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
