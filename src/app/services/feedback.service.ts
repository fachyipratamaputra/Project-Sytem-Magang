import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FeedbackReport {
  idTicket: string;
  reportedBy: string;
  tanggal: string;
  feedback: string;
  keterangan: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private baseUrl = `${environment.apiUrl}/feedback`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(this.baseUrl);
  }
}