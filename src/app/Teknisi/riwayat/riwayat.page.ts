import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TicketService, AssignedTicketApiRow } from '../../services/ticket.service'; // TODO: sesuaikan path

export interface RiwayatTicket {
  idTicket: string;
  reportedBy: string;
  kategori: string;
  tanggalSelesai: string;
  progress: number;
  status: string;
}

@Component({
  selector: 'app-riwayat-tiket',
  templateUrl: './riwayat.page.html',
  styleUrls: ['./riwayat.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class RiwayatTiketPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'riwayat-tiket';

  user = {
    nama: 'Teknisi',
    role: 'teknisi',
  };

  // ===== DATA RIWAYAT TIKET (dari backend) =====
  riwayatList: RiwayatTicket[] = [];
  isLoading = false;
  loadError = '';

  // ===== FILTER & PAGINATION =====
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  constructor(private router: Router, private ticketService: TicketService) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'Teknisi';
      } catch (e) { /* fallback */ }
    }

    this.loadRiwayat();
  }

  loadRiwayat() {
    this.isLoading = true;
    this.loadError = '';
    this.ticketService.getRiwayatMe().subscribe({
      next: (data: AssignedTicketApiRow[]) => {
        this.riwayatList = data.map(this.mapToRiwayatTicket);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Gagal mengambil riwayat tiket', err);
        this.loadError = err?.error?.message || 'Gagal memuat riwayat tiket, coba lagi.';
        this.isLoading = false;
      },
    });
  }

  private mapToRiwayatTicket(row: AssignedTicketApiRow): RiwayatTicket {
    return {
      idTicket: row.id_ticket,
      reportedBy: row.nama_pelapor,
      kategori: row.nama_kategori,
      tanggalSelesai: row.tanggal_selesai || '-',
      progress: row.progress,
      status: row.status_pengerjaan,
    };
  }

  get filteredRiwayat(): RiwayatTicket[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.riwayatList;
    return this.riwayatList.filter(r =>
      r.idTicket.toLowerCase().includes(term) ||
      r.reportedBy.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRiwayat.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedRiwayat(): RiwayatTicket[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRiwayat.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ===== NAVIGASI =====
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }

  goToDashboardTeknisi() { this.setActiveMenu('dashboard-teknisi'); this.router.navigate(['/teknisi/dashboard']); }
  goToTicket() { this.setActiveMenu('ticket'); this.router.navigate(['/teknisi/ticket']); }
  goToProsesTiket() { this.setActiveMenu('proses-tiket'); this.router.navigate(['/teknisi/proses']); }
  goToRiwayatTiket() { this.setActiveMenu('riwayat-tiket'); this.router.navigate(['/teknisi/riwayat']); }
  goToPengaturan() { this.setActiveMenu('pengaturan'); }
  goToProfile() { this.setActiveMenu('profile'); }

  getPageTitle(): string {
    const titles: Record<string, string> = {
      'dashboard-teknisi': 'Dashboard Teknisi',
      'ticket': 'Ticket',
      'proses-tiket': 'Proses Tiket',
      'riwayat-tiket': 'Riwayat Tiket',
      'pengaturan': 'Pengaturan',
    };
    return titles[this.activeMenu] ?? 'Riwayat Tiket';
  }

  getStatusClass(status: string): string {
    if (status === 'Selesai') return 'status-selesai';
    return 'status-default';
  }

  // ===== LOGOUT =====
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}