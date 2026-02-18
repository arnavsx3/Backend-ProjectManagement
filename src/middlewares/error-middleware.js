import { ApiError } from "../utils/api-error.js";

const errorMiddleware = (err, req, res, next) => {
  console.error("Real error:", err);
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export { errorMiddleware };
