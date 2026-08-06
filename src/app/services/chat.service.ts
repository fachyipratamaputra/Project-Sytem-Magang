import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id_chat: number;
  id_ticket: string;
  sender_id: string;
  sender_role: 'Admin' | 'Teknisi' | 'Users';
  sender_name: string;
  message: string | null;
  attachment_url: string | null;
  created_at: string;
  is_read: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private baseUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
    });
    // Catatan: jangan set 'Content-Type' manual di sini kalau mau kirim FormData,
    // browser yang harus nentuin boundary multipart-nya sendiri.
  }

  getChats(idTicket: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${idTicket}/chat`, { headers: this.getHeaders() });
  }

  /** Kirim pesan teks dan/atau foto (foto opsional) */
  sendMessage(idTicket: string, message: string, foto?: File | null): Observable<any> {
    const formData = new FormData();
    if (message) formData.append('message', message);
    if (foto) formData.append('foto', foto);
    return this.http.post(`${this.baseUrl}/${idTicket}/chat`, formData, { headers: this.getHeaders() });
  }

  /** Buat URL foto lampiran chat jadi URL lengkap yang bisa dibuka browser */
  getAttachmentUrl(attachmentUrl: string | null): string | null {
    if (!attachmentUrl) return null;
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${backendBase}${attachmentUrl}`;
  }
}