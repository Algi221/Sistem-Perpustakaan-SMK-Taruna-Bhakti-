// Central export file for all validation schemas
export * from './auth';
export * from './books';
export * from './borrowings';
export * from './reviews';
export * from './profile';
export * from './emailHelper';

// Helper function untuk handle Zod validation errors
export function formatZodError(error) {
  if (error.errors && error.errors.length > 0) {
    return error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
  }
  return [{ field: 'general', message: error.message || 'Validation error' }];
}

// Helper function untuk return validation error response
export function validationErrorResponse(error) {
  const formattedErrors = formatZodError(error);
  return {
    error: 'Validation error',
    details: formattedErrors,
    message: formattedErrors[0]?.message || 'Validation error'
  };
}

