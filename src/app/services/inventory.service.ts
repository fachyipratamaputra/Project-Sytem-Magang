import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InventoryItem {
  kode_asset: string;
  nama_barang: string;
  merk_model: string;
  id_departemen: number;
  dept: string;
  kategori: string;
  pemegang: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token || ''}` });
  }

  getAll(): Observable<InventoryItem[]> {
    return this.http
      .get<ApiResponse<InventoryItem[]>>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map((res) => {
          if (res && res.data) {
            return res.data;
          }
          return [];
        }),
        catchError((err) => {
          console.error('InventoryService error:', err);
          return throwError(() => new Error('Gagal memuat data aset'));
        })
      );
  }
}