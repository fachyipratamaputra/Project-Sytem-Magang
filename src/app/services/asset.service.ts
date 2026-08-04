import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Asset } from '../models/asset.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AssetApiRow {
  kode_asset: string;
  nama_barang: string;
  merk_model: string | null;
  kategori: string;
}

export interface AssetCreatePayload {
  namaBarang: string;
  merkModel?: string;
  idDepartemen: number;
  idKategori: number;
}

@Injectable({ providedIn: 'root' })
export class AssetService {
  // ⚠️ ASUMSI: router inventory ini dipasang di /inventory (bukan di bawah /master),
  // sesuai nama filenya "inventoryController.js" + route terpisah. Sesuaikan kalau beda.
  private baseUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token || ''}` });
  }

  // Users - aset milik sendiri saja (backend: checkRole('Users'))
  getMyAssets(): Observable<Asset[]> {
    return this.http
      .get<ApiResponse<AssetApiRow[]>>(`${this.baseUrl}/my`, { headers: this.getHeaders() })
      .pipe(map((res) => res.data.map(this.mapAsset)));
  }

  // Users & Admin - daftarkan aset baru (kode_asset di-generate otomatis oleh backend)
  create(payload: AssetCreatePayload): Observable<any> {
    return this.http.post(
      this.baseUrl,
      {
        nama_barang: payload.namaBarang,
        merk_model: payload.merkModel || null,
        id_departemen: payload.idDepartemen,
        id_kategori: payload.idKategori,
      },
      { headers: this.getHeaders() }
    );
  }

  private mapAsset(row: AssetApiRow): Asset {
    return {
      kodeAsset: row.kode_asset,
      namaBarang: row.nama_barang,
      merk: row.merk_model ?? '',
      kategori: row.kategori,
    };
  }
}