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
  progress?: number;
  status_pengerjaan?: string;
  user_konfirmasi?: number;
  tanggal_konfirmasi_user?: string | null;
  catatan_penyelesaian?: string | null;
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
  departemen?: string;
  nama_kategori: string;
  nama_sub_kategori: string | null;
  deadline?: string | null;
  is_paused?: number;
  user_konfirmasi?: number;
  tanggal_konfirmasi_user?: string | null;
  admin_konfirmasi?: number;
  tanggal_konfirmasi_admin?: string | null;
  admin_approve?: number;
  admin_approve_by?: string | null;
  admin_approve_at?: string | null;
}

// Kondisi_huruf: kode B/C/D — hanya relevan kalau kondisi === 'NC'
export interface ChecklistItemApiRow {
  id_result: number;
  id_item: number;
  kategori_unit: string;
  uraian_pekerjaan: string;
  alat_yang_digunakan: string | null;
  penerimaan_default: string | null;
  urutan: number;
  kondisi: 'OK' | 'NC' | null;
  // B = Masih Baik, C = Segera Diperbaiki, D = Harus Diganti
  kondisi_huruf: 'B' | 'C' | 'D' | null;
  catatan: string | null;
  checked_at: string | null;
  // flag UI-only (tidak dikirim ke backend) — true saat popup B/C/D terbuka
  _showHurufPicker?: boolean;
}

// 🔥 status approval Check Sheet 3 tingkat, sekarang termasuk path tanda tangan
// (ttd_*) yang otomatis terisi begitu masing-masing user pernah upload
// tanda tangan sekali lewat halaman profil mereka
export interface ChecklistApprovalRow {
  id_ticket: string;
  dibuat_oleh_nik: string | null;
  tanggal_dibuat: string | null;
  nama_dibuat_oleh: string | null;
  ttd_dibuat_oleh: string | null;
  diketahui_oleh_nik: string | null;
  tanggal_diketahui: string | null;
  status_diketahui: 'Menunggu' | 'Approve' | 'Reject';
  catatan_diketahui: string | null;
  nama_diketahui_oleh: string | null;
  ttd_diketahui_oleh: string | null;
  disetujui_oleh_nik: string | null;
  tanggal_disetujui: string | null;
  status_disetujui: 'Menunggu' | 'Approve' | 'Reject';
  catatan_disetujui: string | null;
  nama_disetujui_oleh: string | null;
  ttd_disetujui_oleh: string | null;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private baseUrl = `${environment.apiUrl}/tickets`;
  private checklistUrl = `${environment.apiUrl}/checklist`;
  private profileUrl = `${environment.apiUrl}/profile`;

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

  confirmByUser(idTicket: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${idTicket}/user-konfirmasi`, {});
  }

  // ================================================================
  // CHECKLIST PREVENTIVE (sesuai check sheet PDF)
  // ================================================================
  getChecklistTemplateKategori(): Observable<string[]> {
    return this.http.get<string[]>(`${this.checklistUrl}/template-kategori`);
  }

  getChecklist(idTicket: string): Observable<ChecklistItemApiRow[]> {
    return this.http.get<ChecklistItemApiRow[]>(`${this.checklistUrl}/ticket/${idTicket}`);
  }

  // payload menerima kondisi_huruf (wajib diisi kalau kondisi = 'NC')
  updateChecklistItem(
    idResult: number,
    payload: { kondisi: 'OK' | 'NC' | null; kondisi_huruf?: 'B' | 'C' | 'D' | null; catatan?: string }
  ): Observable<any> {
    return this.http.patch(`${this.checklistUrl}/item/${idResult}`, payload);
  }

  // ================================================================
  // 🔥 APPROVAL CHECK SHEET 3 TINGKAT: Teknisi -> User -> IT Service
  // ================================================================
  getChecklistApproval(idTicket: string): Observable<ChecklistApprovalRow> {
    return this.http.get<ChecklistApprovalRow>(`${this.checklistUrl}/ticket/${idTicket}/approval`);
  }

  ajukanApprovalChecklist(idTicket: string): Observable<any> {
    return this.http.post(`${this.checklistUrl}/ticket/${idTicket}/ajukan`, {});
  }

  approveChecklistByUser(idTicket: string, action: 'Approve' | 'Reject', catatan?: string): Observable<any> {
    return this.http.put(`${this.checklistUrl}/ticket/${idTicket}/user-approve`, { action, catatan });
  }

  approveChecklistByItService(idTicket: string, action: 'Approve' | 'Reject', catatan?: string): Observable<any> {
    return this.http.put(`${this.checklistUrl}/ticket/${idTicket}/itservice-approve`, { action, catatan });
  }

  downloadChecklistPdf(idTicket: string) {
    this.http.get(`${this.checklistUrl}/ticket/${idTicket}/pdf`, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CheckSheet_${idTicket}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Gagal download PDF', err);
        alert('Gagal download PDF: ' + (err?.error?.message || 'PDF belum bisa didownload'));
      }
    });
  }

  // ================================================================
  // 🔥 TANDA TANGAN DIGITAL (upload sekali, otomatis dipakai saat approve)
  // ================================================================
  uploadMySignature(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('signature', file);
    return this.http.post(`${this.profileUrl}/signature`, formData);
  }

  getMySignature(): Observable<{ tanda_tangan: string | null }> {
    return this.http.get<{ tanda_tangan: string | null }>(`${this.profileUrl}/signature`);
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