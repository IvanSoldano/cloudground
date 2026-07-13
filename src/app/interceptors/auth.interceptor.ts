import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap, catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Only intercept API calls
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  return from(authService.getSession()).pipe(
    switchMap(response => {
      const token = response?.data?.session?.access_token;
      
      if (token) {
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(clonedRequest);
      }

      return next(req);
    }),
    catchError(error => {
      console.error('Error in auth interceptor', error);
      return throwError(() => error);
    })
  );
};
