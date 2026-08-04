import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApprovalService {
  private baseUrl = `${environment.apiUrl}/approval`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token || ''}` });
  }

  getList(status?: string): Observable<any> {
    const url = status ? `${this.baseUrl}?status=${encodeURIComponent(status)}` : this.baseUrl;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  process(idTicket: string, keputusan: 'Approve' | 'Reject', catatan?: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${idTicket}`,
      { keputusan, catatan },
      { headers: this.getHeaders() }
    );
  }
}