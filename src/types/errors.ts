/**
 * Structured error types for AppGrav
 *
 * Provides typed error codes, recoverable/non-recoverable classification,
 * and user-friendly messages for consistent error handling across the app.
 */

// Error code hierarchy
export type TAppErrorCode =
  // Authentication errors
  | 'AUTH.INVALID_CREDENTIALS'
  | 'AUTH.SESSION_EXPIRED'
  | 'AUTH.PIN_INVALID'
  | 'AUTH.PIN_RATE_LIMITED'
  | 'AUTH.OFFLINE_AUTH_FAILED'
  // Network errors
  | 'NETWORK.OFFLINE'
  | 'NETWORK.TIMEOUT'
  | 'NETWORK.SERVER_ERROR'
  // Sync errors
  | 'SYNC.CONFLICT'
  | 'SYNC.QUEUE_FULL'
  | 'SYNC.ITEM_FAILED'
  | 'SYNC.ENGINE_ERROR'
  // Payment errors
  | 'PAYMENT.INSUFFICIENT_AMOUNT'
  | 'PAYMENT.INVALID_METHOD'
  | 'PAYMENT.SPLIT_MISMATCH'
  | 'PAYMENT.PROCESSING_FAILED'
  // Validation errors
  | 'VALIDATION.REQUIRED_FIELD'
  | 'VALIDATION.INVALID_FORMAT'
  | 'VALIDATION.OUT_OF_RANGE'
  // Permission errors
  | 'PERMISSION.DENIED'
  | 'PERMISSION.ROLE_REQUIRED'
  // Database errors
  | 'DATABASE.QUERY_FAILED'
  | 'DATABASE.NOT_FOUND'
  | 'DATABASE.CONSTRAINT_VIOLATION'
  // Unknown/generic errors
  | 'UNKNOWN.UNEXPECTED'
  | 'UNKNOWN.EXTERNAL';

/**
 * Structured application error with typed code, recovery hint, and user message.
 */
export class AppError extends Error {
  readonly code: TAppErrorCode;
  readonly recoverable: boolean;
  readonly userMessage: string;
  readonly cause?: Error;

  constructor(options: {
    code: TAppErrorCode;
    message: string;
    recoverable?: boolean;
    userMessage?: string;
    cause?: Error;
  }) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.recoverable = options.recoverable ?? false;
    this.userMessage = options.userMessage ?? options.message;
    this.cause = options.cause;
  }

  /** The error code module (e.g. 'AUTH', 'NETWORK') */
  get module(): string {
    return this.code.split('.')[0];
  }
}

/**
 * Generic operation result type for functions that can fail gracefully.
 */
export interface IOperationResult<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}

/**
 * Wraps an unknown thrown value into an AppError.
 * Use in catch blocks: `catch (e) { throw toAppError(e); }`
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof Error) {
    return new AppError({
      code: 'UNKNOWN.UNEXPECTED',
      message: error.message,
      recoverable: false,
      cause: error,
    });
  }

  return new AppError({
    code: 'UNKNOWN.UNEXPECTED',
    message: String(error),
    recoverable: false,
  });
}
