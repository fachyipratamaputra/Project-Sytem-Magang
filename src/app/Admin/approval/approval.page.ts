import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
export class ApprovalTicketPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'approval-ticket';

  approvalTickets: ApprovalTicket[] = [];
  isLoadingApproval = false;

  returnedTickets: ReturnedTicket[] = [];
  isLoadingReturned = false;

  searchTerm = '';
  filterStatus = '';
  filterDepartemen = '';
  filterKategori = '';

  statusOptions: string[] = ['Menunggu Approval', 'Approve', 'Reject'];
  departemenOptions: string[] = [];
  kategoriOptions: string[] = [];

  currentPage = 1;
  pageSize = 10;

  apiBase = environment.apiUrl.replace(/\/api\/?$/, '');

  constructor(
    private router: Router,
    private ticketService: TicketService
  ) {}

  ngOnInit() {
    this.loadApprovalTickets();
    this.loadReturnedTickets();
  }

  loadApprovalTickets() {
    this.isLoadingApproval = true;
    this.ticketService.getAllRaw().subscribe({
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

  approveTicket(ticket: ApprovalTicket) {
    if (!ticket?.id_ticket) {
      alert('ID Tiket tidak valid.');
      return;
    }
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
    if (!ticket?.id_ticket) {
      alert('ID Tiket tidak valid.');
      return;
    }
    if (!confirm(`Tolak tiket ${ticket.id_ticket}?`)) return;
    this.ticketService.approve(ticket.id_ticket, 'Reject').subscribe({
      next: () => {
        this.loadApprovalTickets();
        alert('Tiket ditolak.');
      },
      error: (err) => alert('Gagal reject: ' + (err.error?.message || err.message))
    });
  }

  approveReturn(ticket: ReturnedTicket) {
    if (!ticket?.id_ticket) {
      alert('ID Tiket tidak valid atau kosong.');
      return;
    }
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
    if (!ticket?.id_ticket) {
      alert('ID Tiket tidak valid atau kosong.');
      return;
    }
    if (!confirm(`Tolak pengembalian tiket ${ticket.id_ticket}? Tiket akan kembali ke teknisi.`)) return;
    this.ticketService.reviewReturn(ticket.id_ticket, 'Reject').subscribe({
      next: () => {
        this.loadReturnedTickets();
        alert('Pengembalian ditolak.');
      },
      error: (err) => alert('Gagal reject return: ' + (err.error?.message || err.message))
    });
  }

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

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }

  // ===== NAVIGASI MENU =====
  goToDashboard() { this.setActiveMenu('dashboard'); this.router.navigate(['/dashboard']); }
  goToListTicket() { this.setActiveMenu('list-ticket'); this.router.navigate(['/list']); }
  goToApprovalTicket() { this.setActiveMenu('approval-ticket'); this.router.navigate(['/approval']); }
  goToAssignmentTicket() { this.setActiveMenu('assignment-ticket'); this.router.navigate(['/assignment']); }
  goToKaryawan() { this.setActiveMenu('karyawan'); this.router.navigate(['/karyawan']); }
  goToUser() { this.setActiveMenu('user'); this.router.navigate(['/users']); }
  goToJabatan() { this.setActiveMenu('jabatan'); this.router.navigate(['/jabatan']); }
  goToDepartemen() { this.setActiveMenu('departemen'); this.router.navigate(['/departemen']); }
  goToBagianDepartemen() { this.setActiveMenu('bagian-departemen'); this.router.navigate(['/bagian-departemen']); }
  goToKategori() { this.setActiveMenu('kategori'); this.router.navigate(['/kategori']); }
  goToSubKategori() { this.setActiveMenu('sub-kategori'); this.router.navigate(['/sub-kategori']); }
  goToTeknisi() { this.setActiveMenu('teknisi'); this.router.navigate(['/teknisi']); }
  goToInventory() { this.setActiveMenu('inventory'); this.router.navigate(['/inventory']); }
  goToSchedule() { this.setActiveMenu('schedule'); this.router.navigate(['/schedule']); } // 🛠️ Ditambahkan untuk mengatasi error
  goToLaporanFeedback() { this.setActiveMenu('laporan-feedback'); this.router.navigate(['/laporan-feedback']); }
  goToStatistikTicket() { this.setActiveMenu('statistik-ticket'); this.router.navigate(['/statistik-ticket']); }
  goToProfile() { this.setActiveMenu('profile'); this.router.navigate(['/profile']); }
  goToNotifikasi() { this.setActiveMenu('notifikasi'); }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}