import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ApprovalService } from '../../services/approval.service';
import { environment } from '../../../environments/environment';

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
  lampiranPath: string;
  status: string;
  prioritas?: 'Low' | 'Normal' | 'Urgent'; // 🔥 Tambahan baru
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

  tickets: ApprovalTicket[] = [];
  isLoading = false;
  errorMessage = '';

  searchTerm = '';
  filterStatus = '';
  filterDepartemen = '';
  filterKategori = '';

  statusOptions: string[] = [];
  departemenOptions: string[] = [];
  kategoriOptions: string[] = [];

  currentPage = 1;
  pageSize = 10;

  constructor(
    private router: Router,
    private approvalService: ApprovalService
  ) {}

  ngOnInit() {
    this.loadApprovalList();
  }

 loadApprovalList() {
    this.isLoading = true;
    this.errorMessage = '';

    this.approvalService.getList().subscribe({
      next: (res: any) => {
        const rows = res?.data || [];
        this.tickets = rows.map((row: any, index: number): ApprovalTicket => ({
          no: index + 1,
          idTicket: row.id_ticket,
          reportedBy: row.reported,
          departemen: row.departemen,
          kategori: row.kategori,
          subKategori: row.sub_kategori,
          tanggal: row.tanggal,
          deskripsi: row.deskripsi,
          lampiran: row.lampiran ? 'Lihat Foto' : '',
          lampiranPath: row.lampiran || '',
          status: row.status,
          // 🔥 Perbaikan: Cek berbagai kemungkinan variasi key dari API backend
          prioritas: row.prioritas || row.priority || row.PRIORITAS || row.Prioritas || 'Normal',
        }));
        this.buildFilterOptions();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Gagal memuat data approval:', err);
        this.errorMessage = 'Gagal memuat data approval ticket.';
        this.isLoading = false;
      }
    });
  }

  getLampiranUrl(lampiranPath: string): string {
    if (!lampiranPath) return '';
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    let cleanPath = lampiranPath.trim().replace(/\\/g, '/');
    const parts = cleanPath.split('/');
    const fileName = parts[parts.length - 1];
    return `${backendBase}/uploads/${fileName}`;
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
    if (s.includes('disetujui') || s.includes('approve') || s.includes('selesai')) return 'status-approved';
    if (s.includes('ditolak') || s.includes('reject')) return 'status-rejected';
    if (s.includes('proses') || s.includes('progress')) return 'status-progress';
    return 'status-default';
  }

  // 🔥 Helper untuk badge prioritas
  getPrioritasClass(prioritas: string): string {
    const p = prioritas?.toLowerCase() || 'normal';
    if (p === 'low') return 'prioritas-low';
    if (p === 'urgent') return 'prioritas-urgent';
    return 'prioritas-normal';
  }

  onApprove(ticket: ApprovalTicket) {
    if (!confirm(`Setujui tiket ${ticket.idTicket}?`)) return;

    this.approvalService.process(ticket.idTicket, 'Approve').subscribe({
      next: () => {
        alert(`Tiket ${ticket.idTicket} berhasil disetujui!`);
        this.loadApprovalList();
      },
      error: (err) => {
        console.error('Gagal approve tiket:', err);
        alert(err?.error?.message || 'Gagal menyetujui tiket.');
      }
    });
  }

  onReject(ticket: ApprovalTicket) {
    const catatan = prompt(`Alasan penolakan tiket ${ticket.idTicket} (opsional):`) || undefined;
    if (!confirm(`Tolak tiket ${ticket.idTicket}?`)) return;

    this.approvalService.process(ticket.idTicket, 'Reject', catatan).subscribe({
      next: () => {
        alert(`Tiket ${ticket.idTicket} ditolak.`);
        this.loadApprovalList();
      },
      error: (err) => {
        console.error('Gagal reject tiket:', err);
        alert(err?.error?.message || 'Gagal menolak tiket.');
      }
    });
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

  goToLaporanFeedback() {
    this.setActiveMenu('laporan-feedback');
    this.router.navigate(['/laporan-feedback']);
  }

  goToStatistikTicket() { this.activeMenu = 'statistik-ticket'; }
  goToProfile() { this.activeMenu = 'profile'; }
}