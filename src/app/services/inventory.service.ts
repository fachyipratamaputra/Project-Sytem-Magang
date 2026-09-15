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
  status_aset?: string;
}

// Hasil statistik jumlah asset per departemen
export interface InventoryStat {
  departemen: string;
  jumlah: number;
}

// Tabel lama (key-value) - dibiarkan untuk kompatibilitas, tidak dipakai lagi di UI
export interface AssetHardware {
  id?: number;
  kode_asset?: string;
  komponen: string;
  spesifikasi: string | null;
  keterangan: string | null;
}

// Detail hardware fixed-field, 1 objek per asset
export interface AssetHardwareDetail {
  serial_no_pc: string;
  mobo_type: string;
  kelas: string;
  processor: string;
  hdd_size: string;
  hdd_model: string;
  hdd_serial_no: string;
  memory_size: string;
  memory_type: string;
  display: string;
}

// Tabel lama (key-value) - dibiarkan untuk kompatibilitas, tidak dipakai lagi di UI
export interface AssetSoftware {
  id?: number;
  kode_asset?: string;
  nama_software: string;
  versi: string | null;
  lisensi: string | null;
  tanggal_install: string | null;
  keterangan: string | null;
}

// Detail software fixed-field, 1 objek per asset
export interface AssetSoftwareDetail {
  operating_system: string;
  serial_no_os: string;
  ms_office: string;
  ms_office_sn: string;
  erp: 'ADA' | 'TIDAK';
  wms: 'ADA' | 'TIDAK';
  eris: 'ADA' | 'TIDAK';
  cmms: 'ADA' | 'TIDAK';
  visio: 'ADA' | 'TIDAK';
  autocad: 'ADA' | 'TIDAK';
  kaspersky: 'ADA' | 'TIDAK';
  ms_project: 'ADA' | 'TIDAK';
  acrobat: 'ADA' | 'TIDAK';
}

// History tiket = rekap tiket yang pernah dibuat untuk asset ini (read-only dari list_ticket)
export interface AssetTicketHistory {
  id_ticket: string;
  tanggal: string;
  deskripsi: string;
  status: string;
  prioritas: string;
  kategori: string | null;
  sub_kategori: string | null;
  pelapor: string;
  teknisi: string | null;
}

// Riwayat perpindahan pemegang asset (read-only, otomatis di-log backend
// setiap kali nik_pemegang berubah lewat update aset)
export interface AssetHolderHistory {
  id?: number;
  kode_asset?: string;
  nik_lama: string | null;
  nama_lama: string | null;
  nik_baru: string | null;
  nama_baru: string | null;
  keterangan: string | null;
  tanggal_pindah: string;
}

// Riwayat perpindahan departemen asset (read-only, otomatis
// di-log backend setiap kali id_departemen berubah lewat update aset —
// baik diubah langsung maupun tidak langsung lewat perubahan pemegang)
export interface AssetDepartmentHistory {
  id?: number;
  kode_asset?: string;
  id_departemen_lama: number | null;
  nama_departemen_lama: string | null;
  id_departemen_baru: number | null;
  nama_departemen_baru: string | null;
  keterangan: string | null;
  tanggal_pindah: string;
}

// Satu kelompok periode pemegang beserta tiket-tiket yang
// terjadi selama periode itu berlangsung
export interface AssetHolderTicketGroup {
  nik_pemegang: string | null;
  nama_pemegang: string;
  periode_mulai: string | null;
  periode_selesai: string | null; // null = masih berlangsung (pemegang saat ini)
  tickets: AssetTicketHistory[];
}

export interface AssetDetail {
  profile: any;
  hardware: AssetHardware[];
  hardwareDetail: AssetHardwareDetail;
  software: AssetSoftware[];
  softwareDetail: AssetSoftwareDetail;
  history: AssetTicketHistory[];
  historyByHolder: AssetHolderTicketGroup[];
  pemegangHistory: AssetHolderHistory[];
  departmentHistory: AssetDepartmentHistory[];
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
        map((res) => (res && res.data ? res.data : [])),
        catchError((err) => {
          console.error('InventoryService error:', err);
          return throwError(() => new Error('Gagal memuat data aset'));
        })
      );
  }

  // ===== STATISTIK UNTUK DASHBOARD CHART =====
  // jenis dikirim sebagai query param ?jenis=..., trim dulu supaya spasi
  // nyasar (misal dari ngModel) tidak bikin mismatch dengan nama_barang di DB
  getStats(jenis?: string): Observable<InventoryStat[]> {
    const cleanJenis = jenis ? jenis.trim() : '';
    const params = cleanJenis ? `?jenis=${encodeURIComponent(cleanJenis)}` : '';
    return this.http
      .get<ApiResponse<InventoryStat[]>>(`${this.apiUrl}/stats${params}`, { headers: this.getHeaders() })
      .pipe(
        map((res) => res.data || []),
        catchError((err) => {
          console.error('InventoryService getStats error:', err);
          return throwError(() => new Error('Gagal memuat statistik'));
        })
      );
  }

  getJenisOptions(): Observable<string[]> {
    return this.http
      .get<ApiResponse<string[]>>(`${this.apiUrl}/jenis-options`, { headers: this.getHeaders() })
      .pipe(
        map((res) => res.data || []),
        catchError((err) => {
          console.error('InventoryService getJenisOptions error:', err);
          return throwError(() => new Error('Gagal memuat jenis asset'));
        })
      );
  }

  // ===== DETAIL ASSET =====
  getDetail(kode: string): Observable<AssetDetail> {
    return this.http
      .get<ApiResponse<AssetDetail>>(`${this.apiUrl}/${kode}/detail`, { headers: this.getHeaders() })
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          console.error('InventoryService getDetail error:', err);
          return throwError(() => new Error('Gagal memuat detail aset'));
        })
      );
  }

  // ===== HARDWARE (lama, key-value - dibiarkan untuk kompatibilitas) =====
  addHardware(kode: string, data: Partial<AssetHardware>): Observable<any> {
    return this.http.post(`${this.apiUrl}/${kode}/hardware`, data, { headers: this.getHeaders() });
  }
  updateHardware(kode: string, id: number, data: Partial<AssetHardware>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${kode}/hardware/${id}`, data, { headers: this.getHeaders() });
  }
  deleteHardware(kode: string, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${kode}/hardware/${id}`, { headers: this.getHeaders() });
  }

  // ===== HARDWARE DETAIL (baru, fixed fields) =====
  saveHardwareDetail(kode: string, data: AssetHardwareDetail): Observable<any> {
    return this.http.put(`${this.apiUrl}/${kode}/hardware-detail`, data, { headers: this.getHeaders() });
  }

  // ===== SOFTWARE (lama, key-value - dibiarkan untuk kompatibilitas) =====
  addSoftware(kode: string, data: Partial<AssetSoftware>): Observable<any> {
    return this.http.post(`${this.apiUrl}/${kode}/software`, data, { headers: this.getHeaders() });
  }
  updateSoftware(kode: string, id: number, data: Partial<AssetSoftware>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${kode}/software/${id}`, data, { headers: this.getHeaders() });
  }
  deleteSoftware(kode: string, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${kode}/software/${id}`, { headers: this.getHeaders() });
  }

  // ===== SOFTWARE DETAIL (baru, fixed fields) =====
  saveSoftwareDetail(kode: string, data: AssetSoftwareDetail): Observable<any> {
    return this.http.put(`${this.apiUrl}/${kode}/software-detail`, data, { headers: this.getHeaders() });
  }
}