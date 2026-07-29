import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';

export interface ApprovalTicket {
  no: number;
  idTicket: string;
  reportedBy: string;
  departemen: string;
  kategori: string;
  subKategori: string;
  tanggal: string;
  deskripsi: string;
  lampiran: string;
  status: string;
}

@Component({
  selector: 'app-approval-ticket',
  templateUrl: './approval.page.html',
  styleUrls: ['./approval.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonIcon],
})
export class ApprovalTicketPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'approval-ticket';

  tickets: ApprovalTicket[] = [
    {
      no: 1,
      idTicket: 'T202612020001',
      reportedBy: 'Desi',
      departemen: 'IT',
      kategori: 'Hardware',
      subKategori: 'Kerusakan monitor',
      tanggal: '02-12-2026',
      deskripsi: 'Monitor layar gelap tidak menampilkan gambar sama sekali setelah listrik padam.',
      lampiran: 'foto',
      status: 'Menunggu Approval',
    },
    {
      no: 2,
      idTicket: 'T202612020002',
      reportedBy: 'Yulita',
      departemen: 'IT',
      kategori: 'Hardware',
      subKategori: 'Kerusakan komponen monitor',
      tanggal: '02-12-2026',
      deskripsi: 'Layar monitor berkedip-kedip terus dan muncul garis vertikal hitam di layar.',
      lampiran: 'foto',
      status: 'Menunggu Approval',
    },
  ];

  searchTerm = '';
  filterStatus = '';
  filterDepartemen = '';
  filterKategori = '';

  statusOptions: string[] = [];
  departemenOptions: string[] = [];
  kategoriOptions: string[] = [];

  currentPage = 1;
  pageSize = 10;

  constructor(private router: Router) {}

  ngOnInit() {
    this.buildFilterOptions();
  }

  private buildFilterOptions() {
    this.statusOptions = [...new Set(this.tickets.map((t) => t.status))];
    this.departemenOptions = [...new Set(this.tickets.map((t) => t.departemen))];
    this.kategoriOptions = [...new Set(this.tickets.map((t) => t.kategori))];
  }

  get filteredTickets(): ApprovalTicket[] {
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

  get pagedTickets(): ApprovalTicket[] {
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
    if (!status) return 'status-default';

    const s = status.toLowerCase();

    if (s.includes('menunggu')) return 'status-pending';
    if (s.includes('disetujui') || s.includes('approved') || s.includes('selesai')) return 'status-approved';
    if (s.includes('ditolak') || s.includes('rejected')) return 'status-rejected';
    if (s.includes('proses') || s.includes('progress')) return 'status-progress';

    return 'status-default';
  }

  onApprove(ticket: ApprovalTicket) {
    ticket.status = 'Disetujui';
    this.buildFilterOptions();
    console.log(`✅ Tiket ${ticket.idTicket} telah DISETUJUI.`);
    alert(`Tiket ${ticket.idTicket} berhasil disetujui!`);
  }

  onReject(ticket: ApprovalTicket) {
    ticket.status = 'Ditolak';
    this.buildFilterOptions();
    console.log(`❌ Tiket ${ticket.idTicket} telah DITOLAK.`);
    alert(`Tiket ${ticket.idTicket} ditolak.`);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
  }

  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToListTicket() { this.router.navigate(['/list']); }
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

  // 🔥 FIX: sebelumnya cuma `this.activeMenu = '/feedback'` (typo, gak match
  // key manapun, dan yang lebih penting: TIDAK PERNAH manggil router.navigate()
  // sama sekali). Sekarang beneran navigasi ke halaman Laporan Feedback.

  goToLaporanFeedback() {
    this.setActiveMenu('laporan-feedback');
    this.router.navigate(['/laporan-feedback']); 
  }

  goToStatistikTicket() { this.activeMenu = 'statistik-ticket'; }
  goToProfile() { this.activeMenu = 'profile'; }
}