import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { KategoriService } from '../services/kategori.service';

export interface SubKategoriRow {
  id: number;
  idKategori: number;
  kategori: string;
  namaSubKategori: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface SubKategoriApiRow {
  id_sub_kategori: number;
  id_kategori: number;
  nama_sub_kategori: string;
}

@Injectable({ providedIn: 'root' })
export class SubKategoriService {
  private baseUrl = `${environment.apiUrl}/master/sub-kategori`;

  constructor(private http: HttpClient, private kategoriService: KategoriService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token || ''}` });
  }

  getAll(): Observable<SubKategoriRow[]> {
    return forkJoin({
      subKategori: this.http.get<ApiResponse<SubKategoriApiRow[]>>(this.baseUrl, { headers: this.getHeaders() }),
      kategori: this.kategoriService.getAll(),
    }).pipe(
      map(({ subKategori, kategori }) =>
        subKategori.data.map((row) => ({
          id: row.id_sub_kategori,
          idKategori: row.id_kategori,
          kategori: kategori.find((k: any) => k.id === row.id_kategori)?.nama || '-',
          namaSubKategori: row.nama_sub_kategori,
        }))
      )
    );
  }

  // 👈 DIKEMBALIKAN — sempat terhapus waktu full-replace sebelumnya, dipakai di sub-kategori.page.ts
  getKategoriOptions() {
    return this.kategoriService.getAll();
  }

  create(idKategori: number, namaSubKategori: string): Observable<any> {
    return this.http.post(this.baseUrl, { id_kategori: idKategori, nama_sub_kategori: namaSubKategori }, { headers: this.getHeaders() });
  }

  update(id: number, idKategori: number, namaSubKategori: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, { id_kategori: idKategori, nama_sub_kategori: namaSubKategori }, { headers: this.getHeaders() });
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}