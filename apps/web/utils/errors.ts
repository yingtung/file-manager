/**
 * API Error handling utilities
 */

export interface ApiError {
  error: string;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
}

/**
 * Extract error message from API response
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error
  ) {
    const apiError = error as { error: string | ApiError };
    // Handle case where error.error is a string (e.g., { error: "message" })
    if (typeof apiError.error === "string") {
      return apiError.error;
    }
    // Handle case where error.error is an ApiError object
    return apiError.error.message || apiError.error.error;
  }

  return "An unexpected error occurred";
}

/**
 * Check if the response contains an error
 */
export function hasError<T>(response: ApiResponse<T>): response is ApiResponse<T> & { error: ApiError } {
  return response.error !== undefined;
}

/**
 * Handle API error and return formatted error object
 */
export function handleApiError(error: unknown): ApiError {
  const message = getErrorMessage(error);
  return {
    error: message,
    message,
  };
}

