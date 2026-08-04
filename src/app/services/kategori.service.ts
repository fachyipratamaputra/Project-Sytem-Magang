import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Kategori {
  id: number;
  nama: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface KategoriApiRow {
  id_kategori: number;
  nama_kategori: string;
}

@Injectable({ providedIn: 'root' })
export class KategoriService {
  // 🔧 DIPERBAIKI: arahkan ke /master/kategori, karena route /api/kategori standalone sudah dihapus
  private baseUrl = `${environment.apiUrl}/master/kategori`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token || ''}` });
  }

  getAll(): Observable<Kategori[]> {
    return this.http
      .get<ApiResponse<KategoriApiRow[]>>(this.baseUrl, { headers: this.getHeaders() })
      .pipe(map((res) => (res.data ?? res as any).map(this.mapKategori)));
  }

  create(nama: string): Observable<Kategori> {
    return this.http
      .post<ApiResponse<KategoriApiRow>>(this.baseUrl, { nama_kategori: nama }, { headers: this.getHeaders() })
      .pipe(map((res) => this.mapKategori(res.data ?? res as any)));
  }

  update(id: number, nama: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, { nama_kategori: nama }, { headers: this.getHeaders() });
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  private mapKategori(row: KategoriApiRow): Kategori {
    return {
      id: row.id_kategori ?? (row as any).id,
      nama: row.nama_kategori ?? (row as any).nama
    };
  }
}