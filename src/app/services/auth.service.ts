import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      nik: string;
      nama: string;
      username: string;
      level: string; // 'Admin' | 'Teknisi' | 'Users' (sesuai kolom level di tabel user)
      departemen: string;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { username, password });
  }

  // ===== SESSION HELPERS =====
  saveSession(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Petakan level dari database ke route dashboard masing-masing role
  getDashboardRouteByLevel(level: string): string {
    switch ((level || '').toLowerCase()) {
      case 'admin':
        return '/dashboard';
      case 'teknisi':
        return '/teknisi/dashboard';
      case 'users':
        return '/users/dashboard';
      default:
        return '/login';
    }
  }
}