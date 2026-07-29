import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export interface ProsesTicket {
  idTicket: string;
  reportedBy: string;
  kategori: string;
  subKategori: string;
  asset: string;
  lampiran: string;
  deskripsi: string;
  progress: number;
  catatan: string;
  status: 'Proses' | 'Selesai';
}

@Component({
  selector: 'app-proses-tiket',
  templateUrl: './proses.page.html',
  styleUrls: ['./proses.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ProsesTiketPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'proses-tiket';

  user = {
    nama: 'Teknisi',
    role: 'teknisi',
  };

  // ===== DATA TIKET YANG SEDANG DIPROSES =====
  tickets: ProsesTicket[] = [
    {
      idTicket: 'T202612020001',
      reportedBy: 'Desi',
      kategori: 'Hardware',
      subKategori: 'Kerusakan monitor',
      asset: 'Laptop',
      lampiran: 'Foto',
      deskripsi: 'Monitor layar gelap tidak menampilkan gambar sama sekali setelah listrik padam.',
      progress: 75,
      catatan: 'Sedang mengganti panel LCD',
      status: 'Proses',
    },
    {
      idTicket: 'T202612020002',
      reportedBy: 'Dewi',
      kategori: 'Hardware',
      subKategori: 'Kerusakan komponen monitor',
      asset: '-',
      lampiran: 'Foto',
      deskripsi: 'Layar monitor berkedip-kedip terus dan muncul garis vertikal hitam di layar.',
      progress: 100,
      catatan: 'Monitor sudah berfungsi normal, tinggal melakukan pengetesan akhir',
      status: 'Selesai',
    },
    {
      idTicket: 'T202612020003',
      reportedBy: 'Yulita',
      kategori: 'Software',
      subKategori: 'Aplikasi error',
      asset: '-',
      lampiran: 'Foto',
      deskripsi: 'Aplikasi tidak bisa login, muncul pesan error "Database connection failed".',
      progress: 30,
      catatan: 'Menunggu update patch dari vendor',
      status: 'Proses',
    },
  ];

  // ===== FILTER & PAGINATION =====
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  constructor(private router: Router) {}

  ngOnInit() {
    // Ambil data user dari localStorage saat login
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'Teknisi';
      } catch (e) { /* fallback */ }
    }
  }

  get filteredTickets(): ProsesTicket[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.tickets;
    return this.tickets.filter(t => 
      t.idTicket.toLowerCase().includes(term) || 
      t.reportedBy.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTickets.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedTickets(): ProsesTicket[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTickets.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ===== FUNGSI UPDATE DATA =====
  updateStatus(ticket: ProsesTicket, status: 'Proses' | 'Selesai') {
    ticket.status = status;
    if (status === 'Selesai' && ticket.progress < 100) {
      ticket.progress = 100;
    }
    console.log(`✅ Tiket ${ticket.idTicket} status diubah menjadi ${status}`);
  }

  updateProgress(ticket: ProsesTicket) {
    if (ticket.progress > 100) ticket.progress = 100;
    if (ticket.progress < 0) ticket.progress = 0;
    // Jika progress 100%, status otomatis Selesai (opsional, tapi biarkan user yang menentukan)
    console.log(`📊 Tiket ${ticket.idTicket} progress diupdate ke ${ticket.progress}%`);
  }

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
    return titles[this.activeMenu] ?? 'Proses Tiket';
  }

  getStatusClass(status: string): string {
    if (status === 'Proses') return 'status-proses';
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