import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export interface TeknisiTicket {
  id: string;
  reportedBy: string;
  kategori: string;
  subKategori: string;
  asset: string;
  deskripsi: string;   // Kolom baru
  lampiran: string;
  tanggalAssign: string;
  status: string;
}

@Component({
  selector: 'app-teknisi-ticket',
  templateUrl: './ticket.page.html',
  styleUrls: ['./ticket.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class TeknisiTicketPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'ticket';

  // Data user teknisi
  user = { nama: 'Muhlison', role: 'teknisi' };

  // ===== DATA TICKET (dummy) =====
  tickets: TeknisiTicket[] = [
    {
      id: 'T202612020001',
      reportedBy: 'Desi',
      kategori: 'Hardware',
      subKategori: 'Kerusakan monitor',
      asset: 'Laptop',
      deskripsi: 'Layar laptop tidak menyala sama sekali, indikator power menyala namun gelap.',
      lampiran: 'Foto',
      tanggalAssign: '02-12-2026',
      status: 'Menunggu Diproses',
    },
    {
      id: 'T202612020002',
      reportedBy: 'Dewi',
      kategori: 'Hardware',
      subKategori: 'Kerusakan komponen monitor',
      asset: 'Monitor',
      deskripsi: 'Monitor berkedip-kedip dan muncul garis vertikal hitam.',
      lampiran: 'Foto',
      tanggalAssign: '02-12-2026',
      status: 'Diproses',
    },
    {
      id: 'T202612020003',
      reportedBy: 'Yulita',
      kategori: 'Software',
      subKategori: 'Aplikasi error',
      asset: 'Laptop',
      deskripsi: 'Aplikasi HRIS tidak bisa login setelah update Windows.',
      lampiran: 'Foto',
      tanggalAssign: '02-12-2026',
      status: 'Selesai',
    },
  ];

  // ==== FILTER ====
  searchTerm = '';
  filterStatus = '';

  statusOptions: string[] = ['Menunggu Diproses', 'Diproses', 'Selesai'];

  // ==== PAGINATION ====
  currentPage = 1;
  pageSize = 10;

  constructor(private router: Router) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'Teknisi';
        this.user.role = parsed.role || 'teknisi';
      } catch (e) {}
    }
  }

  // ===== LOGIKA FILTER & PAGINATION =====
  get filteredTickets(): TeknisiTicket[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.tickets.filter((t) => {
      const matchSearch =
        !term ||
        t.id.toLowerCase().includes(term) ||
        t.reportedBy.toLowerCase().includes(term);
      const matchStatus = !this.filterStatus || t.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTickets.length / this.pageSize));
  }
  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  get pagedTickets(): TeknisiTicket[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTickets.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ===== HELPER =====
  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('menunggu')) return 'status-waiting';
    if (s.includes('diproses')) return 'status-proses';
    if (s.includes('selesai')) return 'status-selesai';
    return 'status-default';
  }

  // ===== AKSI =====
  onProses(ticket: TeknisiTicket) {
    console.log(`🛠️ Memproses ticket: ${ticket.id}`);
    // TODO: arahkan ke halaman Proses Tiket
    // this.router.navigate(['/teknisi/proses', ticket.id]);
  }

  // ===== NAVIGASI =====
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }

  goToDashboardTeknisi() {
    this.setActiveMenu('dashboard-teknisi');
    this.router.navigate(['/teknisi/dashboard']);
  }
  goToTicket() {
    this.setActiveMenu('ticket');
    this.router.navigate(['/teknisi/ticket']);
  }
  goToProsesTiket() {
    this.setActiveMenu('proses-tiket');
    this.router.navigate(['/teknisi/proses']);
  }
  goToRiwayatTiket() {
    this.setActiveMenu('riwayat-tiket');
    this.router.navigate(['/teknisi/riwayat']);
  }
  goToPengaturan() {
    this.setActiveMenu('pengaturan');
  }
  goToProfile() {
    this.setActiveMenu('profile');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getPageTitle(): string {
    const titles: Record<string, string> = {
      'ticket': 'Ticket',
      'dashboard-teknisi': 'Dashboard Teknisi',
      'proses-tiket': 'Proses Tiket',
      'riwayat-tiket': 'Riwayat Tiket',
      'pengaturan': 'Pengaturan',
    };
    return titles[this.activeMenu] ?? 'Ticket';
  }
}