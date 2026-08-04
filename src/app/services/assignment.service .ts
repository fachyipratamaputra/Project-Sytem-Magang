import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private baseUrl = `${environment.apiUrl}/assignment`;
  private teknisiUrl = `${environment.apiUrl}/teknisi`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token || ''}` });
  }

  getAssignableTickets(): Observable<any> {
    return this.http.get(`${this.baseUrl}/assignable`, { headers: this.getHeaders() });
  }

  getTeknisiByKategori(idKategori: number | string): Observable<any> {
    return this.http.get(`${this.teknisiUrl}/by-kategori/${idKategori}`, { headers: this.getHeaders() });
  }

  assignTicket(idTicket: string, idTeknisi: number | string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${idTicket}`,
      { id_teknisi: idTeknisi },
      { headers: this.getHeaders() }
    );
  }
}