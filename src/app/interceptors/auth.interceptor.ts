import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token expired / tidak valid -> paksa logout & balik ke halaman login,
      // tapi jangan proses ulang kalau memang lagi di halaman login (hindari loop)
      if (error.status === 401 && router.url !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login'], {
          queryParams: { sessionExpired: '1' },
        });
      }
      return throwError(() => error);
    })
  );
};