import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';

export interface Ticket {
  idTicket: string;
  reportedBy: string;
  departemen: string;
  tanggal: string;
  kategori: string;
  subKategori: string;
  aset: string;
  lampiran: string;
  teknisi: string;
  status: string;
}

@Component({
  selector: 'app-list-ticket',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonIcon],
})
export class ListTicketPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'list-ticket';

  // ==== DATA TICKET (dummy, ganti ke service/API kalau backend sudah siap) ====
  tickets: Ticket[] = [
    {
      idTicket: 'T202612020001',
      reportedBy: 'DESI',
      departemen: 'IT',
      tanggal: '2026-12-02 16:59:02',
      kategori: 'Hardware',
      subKategori: 'Kerusakan komponen monitor',
      aset: 'AST-0001 - Monitor Samsung 19"',
      lampiran: 'Foto',
      teknisi: 'Muhlison',
      status: 'Proses',
    },
    {
      idTicket: 'T202612020002',
      reportedBy: 'Dewi',
      departemen: 'IT',
      tanggal: '2026-12-02 16:44:45',
      kategori: 'Hardware',
      subKategori: 'Kerusakan komponen monitor',
      aset: '',
      lampiran: 'Foto',
      teknisi: '',
      status: 'Approve internal',
    },
    {
      idTicket: 'T202612020003',
      reportedBy: 'Yulita',
      departemen: 'IT',
      tanggal: '2026-12-02 16:44:45',
      kategori: 'Hardware',
      subKategori: 'Kerusakan komponen monitor',
      aset: '',
      lampiran: 'Foto',
      teknisi: '',
      status: 'Proses',
    },
  ];

  // ==== FILTER ====
  searchTerm = '';
  filterStatus = '';
  filterDepartemen = '';
  filterKategori = '';

  statusOptions: string[] = [];
  departemenOptions: string[] = [];
  kategoriOptions: string[] = [];

  // ==== PAGINATION ====
  currentPage = 1;
  pageSize = 10;

  constructor(private router: Router) {}

  ngOnInit() {
    this.buildFilterOptions();
    // TODO: ganti dengan pemanggilan service, misalnya:
    // this.ticketService.getAll().subscribe(res => { this.tickets = res; this.buildFilterOptions(); });
  }

  private buildFilterOptions() {
    this.statusOptions = [...new Set(this.tickets.map((t) => t.status))];
    this.departemenOptions = [...new Set(this.tickets.map((t) => t.departemen))];
    this.kategoriOptions = [...new Set(this.tickets.map((t) => t.kategori))];
  }

  get filteredTickets(): Ticket[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.tickets.filter((t) => {
      const matchSearch =
        !term ||
        t.idTicket.toLowerCase().includes(term) ||
        t.reportedBy.toLowerCase().includes(term);
      const matchStatus = !this.filterStatus || t.status === this.filterStatus;
      const matchDept = !this.filterDepartemen || t.departemen === this.filterDepartemen;
      const matchKategori = !this.filterKategori || t.kategori === this.filterKategori;
      return matchSearch && matchStatus && matchDept && matchKategori;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTickets.length / this.pageSize));
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedTickets(): Ticket[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTickets.slice(start, start + this.pageSize);
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('proses') || s.includes('progress')) return 'status-proses';
    if (s.includes('approve') || s.includes('approval') || s.includes('waiting')) return 'status-approval';
    if (s.includes('assign')) return 'status-assigned';
    if (s.includes('resolved') || s.includes('closed') || s.includes('selesai')) return 'status-closed';
    if (s.includes('reject') || s.includes('tolak')) return 'status-rejected';
    return 'status-default';
  }

  onNewTicket() {
    // TODO: arahkan ke form New Ticket / buka modal
    this.router.navigate(['/list-ticket/new']);
  }

  onViewDetail(ticket: Ticket) {
    // TODO: arahkan ke halaman Detail Ticket
    this.router.navigate(['/list-ticket', ticket.idTicket]);
  }

  onEditTicket(ticket: Ticket) {
    // TODO: arahkan ke form edit ticket
    this.router.navigate(['/list-ticket', ticket.idTicket, 'edit']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
  }

  // ==== NAVIGASI SIDEBAR ====
  // 🔥 FIX: semua path disamakan persis dengan yang terdaftar di app.routes.ts
  // (sebelumnya banyak yang pakai akhiran "-ticket" padahal route aslinya tanpa itu,
  // jadi Router gagal pindah halaman secara diam-diam / tanpa error di UI).
  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToListTicket() { this.activeMenu = 'list-ticket'; this.router.navigate(['/list']); }
  goToApprovalTicket() { this.router.navigate(['/approval']); }
  goToAssignmentTicket() { this.router.navigate(['/assignment']); }
  goToKaryawan() { this.router.navigate(['/karyawan']); }
  goToUser() { this.router.navigate(['/users']); }
  goToJabatan() { this.router.navigate(['/jabatan']); }
  goToDepartemen() { this.router.navigate(['/departemen']); }
  goToBagianDepartemen() { this.router.navigate(['/bagian-departemen']); }
  goToKategori() { this.router.navigate(['/kategori']); }
  goToSubKategori() { this.router.navigate(['/sub-kategori']); }
  goToTeknisi() { this.router.navigate(['/teknisi']); }
  goToInventory() { this.router.navigate(['/inventory']); }

  
  goToLaporanFeedback() {
    this.setActiveMenu('laporan-feedback');
    this.router.navigate(['/laporan-feedback']); 
  }
  goToStatistikTicket() { this.activeMenu = 'statistik-ticket'; }
  goToProfile() { this.activeMenu = 'profile'; }
}