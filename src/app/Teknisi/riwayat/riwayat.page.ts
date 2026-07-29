import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

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

  // ===== DATA RIWAYAT TIKET (DUMMY) =====
  riwayatList: RiwayatTicket[] = [
    {
      idTicket: 'T202612020001',
      reportedBy: 'Desi',
      kategori: 'Hardware',
      tanggalSelesai: '2026-12-05 14:30:00',
      progress: 100,
      status: 'Selesai',
    },
    {
      idTicket: 'T202612020002',
      reportedBy: 'Dewi',
      kategori: 'Hardware',
      tanggalSelesai: '2026-12-04 10:15:00',
      progress: 100,
      status: 'Selesai',
    },
    {
      idTicket: 'T202612020003',
      reportedBy: 'Yulita',
      kategori: 'Software',
      tanggalSelesai: '2026-12-03 16:45:00',
      progress: 100,
      status: 'Selesai',
    },
  ];

  // ===== FILTER & PAGINATION =====
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  constructor(private router: Router) {}

  ngOnInit() {
    // Ambil data user dari localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'Teknisi';
      } catch (e) { /* fallback */ }
    }
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