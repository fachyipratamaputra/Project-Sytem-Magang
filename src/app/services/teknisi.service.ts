import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Teknisi } from '../models/teknisi.model';

export interface TeknisiOption {
  id_teknisi: number;
  nama: string;
  jumlah_tiket_ditangani: number;
}

// Bentuk mentah persis yang dikirim backend (teknisiController.js -> getAll)
interface TeknisiApiRow {
  id_teknisi: string;
  nik?: string;
  nama: string;
  kategori_spesialis: string | null;
  status: string;
  jumlah_tiket_ditangani: number;
}

@Injectable({
  providedIn: 'root',
})
export class TeknisiService {
  private apiUrl = 'http://localhost:5000/api/teknisi';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
    });
  }

  getAll(): Observable<Teknisi[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map((res) => {
        const rows: TeknisiApiRow[] = Array.isArray(res) ? res : res?.data || [];
        return rows.map(this.mapTeknisi);
      })
    );
  }

  getByKategori(idKategori: number): Observable<TeknisiOption[]> {
    return this.http.get<any>(`${this.apiUrl}/by-kategori/${idKategori}`, {
      headers: this.getHeaders(),
    }).pipe(
      map((res) => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        return [];
      })
    );
  }

  create(data: { nik: string; idKategori: number }): Observable<Teknisi> {
    const payload = { nik: data.nik, id_kategori: data.idKategori };
    return this.http.post<Teknisi>(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  update(id: string, data: { idKategori: number; status: string }): Observable<Teknisi> {
    const payload = { id_kategori: data.idKategori, status: data.status };
    return this.http.put<Teknisi>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() });
  }

  remove(id: string): Observable<Teknisi> {
    return this.http.delete<Teknisi>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Ubah bentuk mentah backend (snake_case) jadi bentuk Teknisi (camelCase)
  // yang dipakai teknisi.page.html
  private mapTeknisi(row: TeknisiApiRow): Teknisi {
    return {
      idTeknisi: row.id_teknisi,
      nik: row.nik ?? '',
      nama: row.nama,
      kategoriSpesialis: row.kategori_spesialis ?? '-',
      status: row.status,
      jumlahTiket: row.jumlah_tiket_ditangani ?? 0,
      jumlahTiketDitangani: row.jumlah_tiket_ditangani ?? 0,
    };
  }
}