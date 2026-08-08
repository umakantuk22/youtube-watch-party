import { AppError } from './AppError';

export * from './AppError';

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized action for current role') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Requested resource not found') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Invalid input payload') {
    super(message, 400);
  }
}
