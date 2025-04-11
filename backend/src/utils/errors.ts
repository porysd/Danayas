import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, name: string, statusCode: number){
    super(message);
    this.name = name;
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super('BadRequestError', message, StatusCodes.BAD_REQUEST);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super('UnauthorizedError', message, StatusCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super('ForbiddenError', message, StatusCodes.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NotFoundError', message, StatusCodes.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('ConflictError', message, StatusCodes.CONFLICT);
  }
}

export function makeError<TError extends Error>(error: TError) {
  const defaultError = {
    name: error.name,
    message: error.message,
  };

  /* Custom errors for JsonWebTokenError + TokenExpiredError*/
  if (error.message.includes('Malformed JSON')) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: { name: 'BadRequestError', message: error.message },
    };
  }
  
  if (error.message.includes('jwt malformed') || error.message.includes('invalid signature')) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: { name: 'BadRequestError', message: 'Invalid token' },
    };
  }
  
  if (error.message.includes('jwt expired')) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      error: { name: 'UnauthorizedError', message: 'Token expired' },
    };
  }

  if(error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      error: defaultError,
    }
  }

  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    error: defaultError,
  }
}