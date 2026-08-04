import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TicketService, AssignedTicketApiRow } from '../../services/ticket.service'; // TODO: sesuaikan path
import { environment } from '../../../environments/environment'; // TODO: sesuaikan path

export interface ProsesTicket {
  idTicket: string;
  reportedBy: string;
  kategori: string;
  subKategori: string;
  asset: string;
  lampiran: string;
  lampiranUrl: string | null;
  deskripsi: string;
  progress: number;
  catatan: string;
  status: 'Menunggu Diproses' | 'Proses' | 'Selesai';
  isSaving?: boolean;
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

  // ===== DATA TIKET YANG SEDANG DIPROSES (dari backend) =====
  tickets: ProsesTicket[] = [];
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

    this.loadTickets();
  }

  loadTickets() {
    this.isLoading = true;
    this.loadError = '';
    this.ticketService.getAssignedMe().subscribe({
      next: (data: AssignedTicketApiRow[]) => {
        // Halaman Proses Tiket cuma nampilin tiket yang sudah mulai dikerjakan / baru selesai,
        // bukan yang masih "Menunggu Diproses" (itu ranahnya halaman Ticket)
        this.tickets = data
          .filter((row) => row.status_pengerjaan !== 'Menunggu Diproses')
          .map(this.mapToProsesTicket);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Gagal mengambil data tiket', err);
        this.loadError = err?.error?.message || 'Gagal memuat data tiket, coba lagi.';
        this.isLoading = false;
      },
    });
  }

  private mapToProsesTicket(row: AssignedTicketApiRow): ProsesTicket {
    const uploadsBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return {
      idTicket: row.id_ticket,
      reportedBy: row.nama_pelapor,
      kategori: row.nama_kategori,
      subKategori: row.nama_sub_kategori || '-',
      asset: row.aset || '-',
      lampiran: row.lampiran ? 'Foto' : '-',
      lampiranUrl: row.lampiran ? `${uploadsBase}${row.lampiran}` : null,
      deskripsi: row.deskripsi,
      progress: row.progress,
      catatan: row.catatan_penyelesaian || '',
      status: row.status_pengerjaan as 'Menunggu Diproses' | 'Proses' | 'Selesai',
    };
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

  // ===== FUNGSI UPDATE DATA (sekarang beneran manggil backend) =====
  updateStatus(ticket: ProsesTicket, status: 'Proses' | 'Selesai') {
    if (status === 'Selesai' && ticket.progress < 100) {
      ticket.progress = 100;
    }
    this.simpanKeBackend(ticket, status);
  }

  updateProgress(ticket: ProsesTicket) {
    if (ticket.progress > 100) ticket.progress = 100;
    if (ticket.progress < 0) ticket.progress = 0;
  }

  simpanKeBackend(ticket: ProsesTicket, status?: 'Proses' | 'Selesai') {
    const statusPengerjaan = status || ticket.status;
    ticket.isSaving = true;

    this.ticketService
      .updateProgress(ticket.idTicket, {
        progress: ticket.progress,
        catatan_penyelesaian: ticket.catatan,
        status_pengerjaan: statusPengerjaan,
      })
      .subscribe({
        next: () => {
          ticket.status = statusPengerjaan;
          ticket.isSaving = false;
          if (statusPengerjaan === 'Selesai') {
            // Sudah selesai, hilangkan dari daftar Proses Tiket (pindah ke Riwayat)
            this.tickets = this.tickets.filter((t) => t.idTicket !== ticket.idTicket);
          }
        },
        error: (err: any) => {
          ticket.isSaving = false;
          alert(err?.error?.message || 'Gagal menyimpan perubahan');
        },
      });
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