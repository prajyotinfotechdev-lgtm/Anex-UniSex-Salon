import { BaseAppError } from './BaseAppError';

export class ValidationError extends BaseAppError {
  constructor(message: string, errors?: any[]) {
    super(message, 400, true, errors);
  }
}

export class UnauthorizedError extends BaseAppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, true);
  }
}

export class ForbiddenError extends BaseAppError {
  constructor(message = 'Forbidden') {
    super(message, 403, true);
  }
}

export class NotFoundError extends BaseAppError {
  constructor(message = 'Not Found') {
    super(message, 404, true);
  }
}

export class ConflictError extends BaseAppError {
  constructor(message = 'Conflict') {
    super(message, 409, true);
  }
}

export class DatabaseError extends BaseAppError {
  constructor(message = 'Database Error') {
    super(message, 500, true);
  }
}

export class InternalServerError extends BaseAppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500, false);
  }
}
