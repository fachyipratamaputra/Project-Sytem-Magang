import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { BagianDepartemen } from '../models/Bagian departemen.model ';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface BagianApiRow {
  id_bagian: number;
  id_departemen: number;
  nama_bagian: string;
  departemen: string; // nama departemen, hasil JOIN di backend
}

@Injectable({ providedIn: 'root' })
export class BagianDepartemenService {
  private baseUrl = `${environment.apiUrl}/master/bagian-departemen`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token || ''}` });
  }

  getAll(): Observable<BagianDepartemen[]> {
    return this.http
      .get<ApiResponse<BagianApiRow[]>>(this.baseUrl, { headers: this.getHeaders() })
      .pipe(
        map((res) =>
          res.data.map((row): BagianDepartemen => ({
            idBagian: row.id_bagian,
            departemen: row.departemen,
            bagian: row.nama_bagian,
          }))
        )
      );
  }

  create(payload: { idDepartemen: number; bagian: string }): Observable<any> {
    return this.http.post(
      this.baseUrl,
      { id_departemen: payload.idDepartemen, nama_bagian: payload.bagian },
      { headers: this.getHeaders() }
    );
  }

  update(id: number, payload: { idDepartemen: number; bagian: string }): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${id}`,
      { id_departemen: payload.idDepartemen, nama_bagian: payload.bagian },
      { headers: this.getHeaders() }
    );
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}