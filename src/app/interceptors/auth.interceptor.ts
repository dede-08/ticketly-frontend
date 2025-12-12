import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  //URLs publicas que no necesitan token
  const publicUrls = ['/auth/login', '/auth/register'];
  const isPublicUrl = publicUrls.some((url) => req.url.includes(url));

  if (isPublicUrl) {
    return next(req);
  }

  //agregar token si existe
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error HTTP:', error.status, error.url);

      //si el error es 401 y NO es la peticion de refresh
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        const refreshToken = authService.getRefreshToken();

        //solo intentar refrescar si tenemos refresh token
        if (refreshToken) {
          console.log('Intentando refrescar token...');

          return authService.refreshToken().pipe(
            switchMap((response) => {
              console.log('Token refrescado exitosamente');
              //reintentar la petición original con el nuevo token
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access}`,
                },
              });
              return next(clonedReq);
            }),
            catchError((refreshError) => {
              console.error('Error al refrescar token:', refreshError);
              //solo cerrar sesion si el refresh token también falla
              return throwError(() => refreshError);
            })
          );
        } else {
          //no hay refresh token, cerrar sesion
          console.log('No hay refresh token, cerrando sesión');
          authService.logout();
        }
      }

      //para otros errores, solo propagarlos sin cerrar sesion
      return throwError(() => error);
    })
  );
};
