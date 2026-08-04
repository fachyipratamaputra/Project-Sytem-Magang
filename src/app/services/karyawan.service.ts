import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Karyawan } from '../Admin/karyawan/karyawan.page';

@Injectable({
  providedIn: 'root'
})
export class KaryawanService {
  // Sesuaikan URL endpoint backend Anda (misal port 3000 atau 5000)
  private apiUrl = 'http://localhost:5000/api/karyawan';

  constructor(private http: HttpClient) {}

  getKaryawan(): Observable<Karyawan[]> {
    return this.http.get<Karyawan[]>(this.apiUrl);
  }

  tambahKaryawan(data: Karyawan): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateKaryawan(id: number, data: Karyawan): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  hapusKaryawan(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}