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

// Bentuk data mentah persis seperti yang dikirim backend (sesuai BASE_SELECT terbaru di ticketController.js)
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
}

export interface TicketFilter {
  status?: string;
  id_kategori?: string;
  id_departemen?: string;
  search?: string;
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
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private baseUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  /** ADMIN - List Ticket (dengan filter opsional) */
  getAll(filter?: TicketFilter): Observable<Ticket[]> {
    const params: Record<string, string> = {};
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
    }
    return this.http
      .get<ApiResponse<TicketApiRow[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.data.map(this.mapTicket)));
  }

  /** USERS - My Ticket, versi data mentah */
  getMineRaw(): Observable<TicketApiRow[]> {
    return this.http
      .get<ApiResponse<TicketApiRow[]>>(`${this.baseUrl}/my`)
      .pipe(map((res) => res.data));
  }

  /** USERS - My Ticket, versi sudah di-map */
  getMine(): Observable<Ticket[]> {
    return this.http
      .get<ApiResponse<TicketApiRow[]>>(`${this.baseUrl}/my`)
      .pipe(map((res) => res.data.map(this.mapTicket)));
  }

  /** Detail tiket (semua role) */
  getDetail(idTicket: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${idTicket}`).pipe(map((res) => res.data));
  }

  /** ADMIN - Approve / Reject tiket */
  approve(idTicket: string, statusApproval: 'Approve' | 'Reject', catatanApproval?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${idTicket}/approval`, {
      status_approval: statusApproval,
      catatan_approval: catatanApproval,
    });
  }

  /** ADMIN - Assign tiket ke teknisi */
  assign(idTicket: string, idTeknisi: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${idTicket}/assign`, { id_teknisi: idTeknisi });
  }

  /** USERS - buat tiket baru (multipart, karena ada lampiran foto) */
  create(payload: { id_kategori: string; id_sub_kategori?: string; kode_asset?: string; deskripsi: string }, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('id_kategori', payload.id_kategori);
    if (payload.id_sub_kategori) formData.append('id_sub_kategori', payload.id_sub_kategori);
    if (payload.kode_asset) formData.append('kode_asset', payload.kode_asset);
    formData.append('deskripsi', payload.deskripsi);
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

  updateProgress(
    idTicket: string,
    payload: { progress: number; catatan_penyelesaian?: string; status_pengerjaan: 'Menunggu Diproses' | 'Proses' | 'Selesai' }
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/${idTicket}/proses`, payload);
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