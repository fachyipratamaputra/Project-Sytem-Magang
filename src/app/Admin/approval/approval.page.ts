import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // ✅ Import Router sudah benar
import { IonicModule } from '@ionic/angular';
import { TicketService } from '../../services/ticket.service';
import { environment } from '../../../environments/environment';

export interface ApprovalTicket {
  id_ticket: string;
  reported: string;
  dept: string;
  nama_kategori: string;
  nama_sub_kategori: string;
  tanggal: string;
  deskripsi: string;
  lampiran: string | null;
  prioritas?: 'Low' | 'Normal' | 'Urgent';
  status_approval?: string;
}

export interface ReturnedTicket {
  id_ticket: string;
  reported: string;
  dept: string;
  kategori: string;
  sub_kategori: string | null;
  teknisi_nama: string;
  return_reason: string;
  return_status: string;
}

@Component({
  selector: 'app-approval',
  templateUrl: './approval.page.html',
  styleUrls: ['./approval.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
// ✅ Nama class diubah menjadi ApprovalTicketPage agar cocok dengan app.routes.ts
export class ApprovalTicketPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'approval-ticket';

  // ===== Data Tiket Approval Biasa =====
  approvalTickets: ApprovalTicket[] = [];
  isLoadingApproval = false;

  // ===== Data Tiket Dikembalikan =====
  returnedTickets: ReturnedTicket[] = [];
  isLoadingReturned = false;

  // ===== Filter & Pagination (Approval) =====
  searchTerm = '';
  filterStatus = '';
  filterDepartemen = '';
  filterKategori = '';

  statusOptions: string[] = ['Menunggu Approval', 'Approve', 'Reject'];
  departemenOptions: string[] = [];
  kategoriOptions: string[] = [];

  currentPage = 1;
  pageSize = 10;

  // ===== Helper untuk API URL =====
  apiBase = environment.apiUrl.replace(/\/api\/?$/, '');

  constructor(
    private router: Router,         // ✅ Router di-inject dengan benar
    private ticketService: TicketService
  ) {}

  ngOnInit() {
    this.loadApprovalTickets();
    this.loadReturnedTickets();
  }

  // ==========================================
  // AMBIL TIKET APPROVAL
  // ==========================================
  loadApprovalTickets() {
    this.isLoadingApproval = true;
    this.ticketService.getAll().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        this.approvalTickets = data
          .filter((t: any) => t.status === 'Menunggu Approval')
          .map((t: any) => ({
            id_ticket: t.id_ticket,
            reported: t.reported,
            dept: t.dept,
            nama_kategori: t.nama_kategori,
            nama_sub_kategori: t.nama_sub_kategori || '-',
            tanggal: t.tanggal,
            deskripsi: t.deskripsi || '-',
            lampiran: t.lampiran,
            prioritas: t.prioritas || 'Normal',
            status_approval: t.status_approval || 'Menunggu Approval'
          }));
        this.buildFilterOptions();
        this.isLoadingApproval = false;
      },
      error: (err) => {
        console.error('Gagal memuat tiket approval:', err);
        this.isLoadingApproval = false;
      }
    });
  }

  private buildFilterOptions() {
    this.departemenOptions = [...new Set(this.approvalTickets.map((t) => t.dept).filter(Boolean))];
    this.kategoriOptions = [...new Set(this.approvalTickets.map((t) => t.nama_kategori).filter(Boolean))];
  }

  // ==========================================
  // AMBIL TIKET DIKEMBALIKAN
  // ==========================================
  loadReturnedTickets() {
    this.isLoadingReturned = true;
    this.ticketService.getReturnedTickets().subscribe({
      next: (res: any) => {
        this.returnedTickets = res?.data || res || [];
        this.isLoadingReturned = false;
      },
      error: (err) => {
        console.error('Gagal memuat tiket pengembalian:', err);
        this.isLoadingReturned = false;
      }
    });
  }

  // ==========================================
  // AKSI APPROVAL BIASA
  // ==========================================
  approveTicket(ticket: ApprovalTicket) {
    if (!confirm(`Setujui tiket ${ticket.id_ticket}?`)) return;
    this.ticketService.approve(ticket.id_ticket, 'Approve').subscribe({
      next: () => {
        this.loadApprovalTickets();
        alert('Tiket berhasil disetujui.');
      },
      error: (err) => alert('Gagal approve: ' + (err.error?.message || err.message))
    });
  }

  rejectTicket(ticket: ApprovalTicket) {
    if (!confirm(`Tolak tiket ${ticket.id_ticket}?`)) return;
    this.ticketService.approve(ticket.id_ticket, 'Reject').subscribe({
      next: () => {
        this.loadApprovalTickets();
        alert('Tiket ditolak.');
      },
      error: (err) => alert('Gagal reject: ' + (err.error?.message || err.message))
    });
  }

  // ==========================================
  // AKSI REVIEW PENGEMBALIAN
  // ==========================================
  approveReturn(ticket: ReturnedTicket) {
    if (!confirm(`Setujui pengembalian tiket ${ticket.id_ticket}? Tiket akan kembali ke status Menunggu Approval.`)) return;
    this.ticketService.reviewReturn(ticket.id_ticket, 'Approve').subscribe({
      next: () => {
        this.loadReturnedTickets();
        this.loadApprovalTickets();
        alert('Pengembalian disetujui.');
      },
      error: (err) => alert('Gagal approve return: ' + (err.error?.message || err.message))
    });
  }

  rejectReturn(ticket: ReturnedTicket) {
    if (!confirm(`Tolak pengembalian tiket ${ticket.id_ticket}? Tiket akan kembali ke teknisi.`)) return;
    this.ticketService.reviewReturn(ticket.id_ticket, 'Reject').subscribe({
      next: () => {
        this.loadReturnedTickets();
        alert('Pengembalian ditolak.');
      },
      error: (err) => alert('Gagal reject return: ' + (err.error?.message || err.message))
    });
  }

  // ==========================================
  // FILTER & PAGINATION (Approval)
  // ==========================================
  get filteredApprovalTickets(): ApprovalTicket[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.approvalTickets.filter((t) => {
      const matchSearch = !term || 
        t.id_ticket.toLowerCase().includes(term) || 
        t.reported.toLowerCase().includes(term);
      const matchStatus = !this.filterStatus || t.status_approval === this.filterStatus;
      const matchDept = !this.filterDepartemen || t.dept === this.filterDepartemen;
      const matchKategori = !this.filterKategori || t.nama_kategori === this.filterKategori;
      return matchSearch && matchStatus && matchDept && matchKategori;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredApprovalTickets.length / this.pageSize));
  }
  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  get pagedApprovalTickets(): ApprovalTicket[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredApprovalTickets.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  getLampiranUrl(lampiranPath: string | null): string | null {
    if (!lampiranPath) return null;
    return this.apiBase + lampiranPath;
  }

  // ==========================================
  // NAVIGASI SIDEBAR
  // ==========================================
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }

  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToListTicket() { this.router.navigate(['/list']); }
  goToApprovalTicket() { this.activeMenu = 'approval-ticket'; this.router.navigate(['/approval']); }
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
  goToLaporanFeedback() { this.setActiveMenu('laporan-feedback'); this.router.navigate(['/laporan-feedback']); }
  goToStatistikTicket() { this.setActiveMenu('statistik-ticket'); }
  goToProfile() { this.activeMenu = 'profile'; this.router.navigate(['/profile']); }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}