export class SessionAlreadyRotatedError extends Error {
  constructor() {
    super('Refresh session has already been rotated.');
  }
}
