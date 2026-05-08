/* eslint-disable no-console */

/**
 * Authentication logger utility
 */
export class AuthLogger {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log authentication events
   */
  static log(event: string, data?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.log(`[AUTH] ${event}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
}
