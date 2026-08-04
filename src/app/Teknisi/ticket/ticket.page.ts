import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TicketService, AssignedTicketApiRow } from '../../services/ticket.service'; 
import { environment } from '../../../environments/environment'; 

export interface TeknisiTicket {
  id: string;
  reportedBy: string;
  kategori: string;
  subKategori: string;
  asset: string;
  deskripsi: string;
  lampiran: string;
  lampiranUrl: string | null; 
  tanggalAssign: string;
  status: string;
  isProsesing?: boolean;
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

  user = { nama: 'Teknisi', role: 'teknisi' };

  tickets: TeknisiTicket[] = [];
  isLoading = false;
  loadError = '';

  searchTerm = '';
  filterStatus = '';

  statusOptions: string[] = ['Menunggu Diproses', 'Proses', 'Selesai'];

  currentPage = 1;
  pageSize = 10;

  constructor(private router: Router, private ticketService: TicketService) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'Teknisi';
        this.user.role = parsed.role || 'teknisi';
      } catch (e) {}
    }

    this.loadTickets();
  }

  loadTickets() {
    this.isLoading = true;
    this.loadError = '';
    this.ticketService.getAssignedMe().subscribe({
      next: (data: AssignedTicketApiRow[]) => {
        this.tickets = (data || []).map(this.mapToTeknisiTicket);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Gagal mengambil daftar tiket', err);
        this.loadError = err?.error?.message || 'Gagal memuat data tiket, coba lagi.';
        this.isLoading = false;
      },
    });
  }

  private mapToTeknisiTicket(row: any): TeknisiTicket {
    const uploadsBase = environment.apiUrl.replace(/\/api\/?$/, ''); 
    return {
      id: row.id_ticket || row.id,
      reportedBy: row.nama_pelapor || row.reported || '-',
      kategori: row.nama_kategori || row.kategori || '-',
      subKategori: row.nama_sub_kategori || row.sub_kategori || '-',
      asset: row.aset || row.asset || '-',
      deskripsi: row.deskripsi || '-',
      lampiran: row.lampiran ? 'Foto' : '-',
      lampiranUrl: row.lampiran ? `${uploadsBase}${row.lampiran}` : null,
      tanggalAssign: row.tanggal_assign || '-',
      // Fallback pengecekan status dari berbagai kemungkinan key backend
      status: row.status_pengerjaan || row.status || 'Menunggu Diproses',
    };
  }

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

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('menunggu')) return 'status-waiting';
    if (s.includes('proses')) return 'status-proses';
    if (s.includes('selesai')) return 'status-selesai';
    return 'status-default';
  }

  onProses(ticket: TeknisiTicket) {
    if (ticket.status === 'Menunggu Diproses') {
      ticket.isProsesing = true;
      this.ticketService
        .updateProgress(ticket.id, { progress: 0, status_pengerjaan: 'Proses' })
        .subscribe({
          next: () => {
            ticket.isProsesing = false;
            this.router.navigate(['/teknisi/proses'], { queryParams: { id: ticket.id } });
          },
          error: (err: any) => {
            ticket.isProsesing = false;
            alert(err?.error?.message || 'Gagal memulai proses tiket');
          },
        });
    } else {
      this.router.navigate(['/teknisi/proses'], { queryParams: { id: ticket.id } });
    }
  }

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