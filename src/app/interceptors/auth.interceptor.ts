import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  // URLs públicas que no necesitan token
  const publicUrls = ['/auth/login', '/auth/register'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  if (isPublicUrl) {
    return next(req);
  }

  // Agregar token si existe
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error HTTP:', error.status, error.url);

      // Si el error es 401 y NO es la petición de refresh
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        const refreshToken = authService.getRefreshToken();
        
        // Solo intentar refrescar si tenemos refresh token
        if (refreshToken) {
          console.log('Intentando refrescar token...');
          
          return authService.refreshToken().pipe(
            switchMap((response) => {
              console.log('Token refrescado exitosamente');
              // Reintentar la petición original con el nuevo token
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access}`
                }
              });
              return next(clonedReq);
            }),
            catchError((refreshError) => {
              console.error('Error al refrescar token:', refreshError);
              // Solo cerrar sesión si el refresh token también falló
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          // No hay refresh token, cerrar sesión
          console.log('No hay refresh token, cerrando sesión');
          authService.logout();
        }
      }

      // Para otros errores, solo propagarlos sin cerrar sesión
      return throwError(() => error);
    })
  );
};
