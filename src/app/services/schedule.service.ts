import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface Schedule {
  id: number;
  id_schedule?: number;
  nama: string;
  nama_schedule?: string;
  id_departemen: number;
  id_kategori: number;
  id_sub_kategori: number | null;
  frekuensi: number;
  satuan: 'hari' | 'minggu' | 'bulan' | 'tahun';
  id_teknisi_utama: number | null;
  id_teknisi_pendamping: number | null;
  deskripsi: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  nama_kategori?: string;
  teknisi_list?: string;
  next_maintenance?: string;
  total_aset?: number;
  progress?: number;
  status_pengerjaan?: string;
  completed_aset?: number;
  progress_dates?: string[];
  max_progress?: number;   // 🔥 TAMBAHKAN
}

export interface DepartmentSchedule {
  id_departemen: number;
  nama_departemen: string;
  schedules: Schedule[];
  total_aktif: number;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private apiUrl = 'http://localhost:5000/api/schedule';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
  }

  getDepartmentsWithSchedules(): Observable<DepartmentSchedule[]> {
    return this.http.get<DepartmentSchedule[]>(`${this.apiUrl}/departments`, {
      headers: this.getHeaders(),
    });
  }

  getSchedulesByDepartment(deptId: number): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/department/${deptId}`, {
      headers: this.getHeaders(),
    });
  }

  getAssetsBySchedule(scheduleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${scheduleId}/assets`, {
      headers: this.getHeaders(),
    });
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() });
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  toggleActive(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle`, {}, { headers: this.getHeaders() });
  }
}