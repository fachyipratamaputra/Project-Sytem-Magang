import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Cek apakah ada token di LocalStorage
    const token = localStorage.getItem('token');

    if (token) {
      return true; // Jika ada token, izinkan masuk
    } else {
      // Jika tidak ada token, lempar kembali ke halaman login
      this.router.navigate(['/login']);
      return false;
    }
  }
}