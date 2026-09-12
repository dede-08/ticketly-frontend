import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Centraliza el logging de la app.
 * - `debug` solo escribe en desarrollo (nunca en producción).
 * - `warn` / `error` siempre escriben (los permite la regla `no-console`).
 * No registrar nunca PII (emails, nombres) ni tokens.
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  debug(message: string, ...args: unknown[]): void {
    if (!environment.production) {
      console.log(message, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(message, ...args);
  }
}
