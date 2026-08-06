import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AvailableKaryawan {
  nik: string;
  nama: string;
  departemen: string;
}

@Injectable({ providedIn: 'root' })
export class KaryawanService {
  private apiUrl = `${environment.apiUrl}/karyawan`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token || ''}` });
  }

  // 🔥 Method getAll() inilah yang dipanggil oleh inventory.page.ts
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  // Method khusus mengambil karyawan yang belum punya akun user
  getAvailable(): Observable<AvailableKaryawan[]> {
    return this.http.get<AvailableKaryawan[]>(`${this.apiUrl}/available`, { headers: this.getHeaders() });
  }
}