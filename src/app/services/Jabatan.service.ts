import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JabatanService {
  private baseUrl = `${environment.apiUrl}/master/jabatan`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token || ''}` });
  }

  getAll(): Observable<any> {
    return this.http.get(this.baseUrl, { headers: this.getHeaders() });
  }

  create(namaJabatan: string): Observable<any> {
    return this.http.post(this.baseUrl, { nama_jabatan: namaJabatan }, { headers: this.getHeaders() });
  }

  update(id: number, namaJabatan: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, { nama_jabatan: namaJabatan }, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}