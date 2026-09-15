import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowedRoles: string[] = route.data?.['roles'] || [];

    // Kalau route tidak menentukan roles, anggap semua role yang login boleh masuk
    if (allowedRoles.length === 0) return true;

    const storedUser = localStorage.getItem('user');
    let userRole = '';
    try {
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      userRole = (parsed?.role || parsed?.level || '').toString();
    } catch (e) {
      userRole = '';
    }

    const isAllowed = allowedRoles.some(
      (r) => r.toLowerCase() === userRole.toLowerCase()
    );

    if (!isAllowed) {
      // Role tidak cocok -> redirect ke dashboard sesuai role, atau login kalau tidak dikenali
      const fallback = this.getFallbackRoute(userRole);
      this.router.navigate([fallback]);
      return false;
    }

    return true;
  }

  private getFallbackRoute(userRole: string): string {
    const role = userRole.toLowerCase();
    if (role === 'admin') return '/dashboard';
    if (role === 'teknisi') return '/teknisi/dashboard';
    if (role === 'users' || role === 'user') return '/users/dashboard';
    return '/login';
  }
}