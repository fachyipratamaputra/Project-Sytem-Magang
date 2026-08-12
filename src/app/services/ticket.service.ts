import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Ticket {
  idTicket: string;
  reportedBy: string;
  departemen: string;
  tanggal: string;
  kategori: string;
  subKategori: string;
  aset: string;
  lampiran: string;
  teknisi: string;
  status: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TicketApiRow {
  id_ticket: string;
  reported: string;
  dept: string;
  tanggal: string;
  nama_kategori: string;
  nama_sub_kategori: string | null;
  kode_asset: string | null;
  aset: string | null;
  lampiran: string | null;
  teknisi: string | null;
  status: string;
  prioritas?: 'Low' | 'Normal' | 'Urgent';
  deadline?: string | null;
  is_paused?: number;
  tanggal_assign?: string | null;
  tanggal_selesai?: string | null;
  // 🔥 TAMBAHKAN PROGRESS
  progress?: number;
  status_pengerjaan?: string;
}

export interface AssignedTicketApiRow {
  id_assignment: number;
  progress: number;
  status_pengerjaan: 'Menunggu Diproses' | 'Proses' | 'Selesai';
  tanggal_assign: string;
  tanggal_selesai: string | null;
  catatan_penyelesaian: string | null;
  id_ticket: string;
  deskripsi: string;
  lampiran: string | null;
  kode_asset: string | null;
  aset: string | null;
  nama_pelapor: string;
  nama_kategori: string;
  nama_sub_kategori: string | null;
  deadline?: string | null;
  is_paused?: number;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private baseUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  getAll(filter?: any): Observable<Ticket[]> {
    const params: Record<string, string> = {};
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value) params[key] = value as string;
      });
    }
    return this.http
      .get<ApiResponse<TicketApiRow[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.data.map(this.mapTicket)));
  }

  getAllRaw(filter?: any): Observable<TicketApiRow[]> {
    const params: Record<string, string> = {};
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value) params[key] = value as string;
      });
    }
    return this.http
      .get<ApiResponse<TicketApiRow[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  getMineRaw(): Observable<TicketApiRow[]> {
    return this.http
      .get<ApiResponse<TicketApiRow[]>>(`${this.baseUrl}/my`)
      .pipe(map((res) => res.data));
  }

  getMine(): Observable<Ticket[]> {
    return this.http
      .get<ApiResponse<TicketApiRow[]>>(`${this.baseUrl}/my`)
      .pipe(map((res) => res.data.map(this.mapTicket)));
  }

  getDetail(idTicket: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${idTicket}`).pipe(map((res) => res.data));
  }

  remove(idTicket: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${idTicket}`).pipe(map((res) => res.data));
  }

  approve(idTicket: string, statusApproval: 'Approve' | 'Reject', catatanApproval?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${idTicket}/approval`, {
      status_approval: statusApproval,
      catatan_approval: catatanApproval,
    });
  }

  assign(idTicket: string, idTeknisi: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${idTicket}/assign`, { id_teknisi: idTeknisi });
  }

  create(payload: { 
    id_kategori: string; 
    id_sub_kategori?: string; 
    kode_asset?: string; 
    deskripsi: string;
    prioritas: 'Low' | 'Normal' | 'Urgent'; 
  }, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('id_kategori', payload.id_kategori);
    if (payload.id_sub_kategori) formData.append('id_sub_kategori', payload.id_sub_kategori);
    if (payload.kode_asset) formData.append('kode_asset', payload.kode_asset);
    formData.append('deskripsi', payload.deskripsi);
    formData.append('prioritas', payload.prioritas);
    if (file) formData.append('lampiran', file);
    return this.http.post(this.baseUrl, formData);
  }

  getAssignedMe(): Observable<AssignedTicketApiRow[]> {
    return this.http
      .get<ApiResponse<AssignedTicketApiRow[]>>(`${this.baseUrl}/assigned/me`)
      .pipe(map((res) => res.data));
  }

  getRiwayatMe(): Observable<AssignedTicketApiRow[]> {
    return this.http
      .get<ApiResponse<AssignedTicketApiRow[]>>(`${this.baseUrl}/riwayat/me`)
      .pipe(map((res) => res.data));
  }

  getProgressHistory(idTicket: string): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${this.baseUrl}/${idTicket}/progress-history`)
      .pipe(map((res) => res.data));
  }

  togglePause(idTicket: string, payload?: { progress: number; catatan_penyelesaian?: string; status_pengerjaan: string }): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}/${idTicket}/toggle-pause`, payload || {});
  }

  updateProgress(
    idTicket: string,
    payload: { progress: number; catatan_penyelesaian?: string; status_pengerjaan: 'Menunggu Diproses' | 'Proses' | 'Selesai' }
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/${idTicket}/proses`, payload);
  }

  requestReturn(idTicket: string, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${idTicket}/return`, { return_reason: reason });
  }

  getReturnedTickets(): Observable<any> {
    return this.http.get(`${this.baseUrl}/returned`);
  }

  reviewReturn(idTicket: string, action: 'Approve' | 'Reject'): Observable<any> {
    return this.http.put(`${this.baseUrl}/${idTicket}/return-review`, { action });
  }

  private mapTicket(row: TicketApiRow): Ticket {
    return {
      idTicket: row.id_ticket,
      reportedBy: row.reported,
      departemen: row.dept,
      tanggal: row.tanggal,
      kategori: row.nama_kategori,
      subKategori: row.nama_sub_kategori ?? '',
      aset: row.aset ?? '',
      lampiran: row.lampiran ?? '',
      teknisi: row.teknisi ?? '',
      status: row.status,
    };
  }
}