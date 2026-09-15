import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { AssignmentService } from '../../services/assignment.service ';
import { TicketService } from '../../services/ticket.service'; // 🔥 Tambahkan TicketService
import { TeknisiOption } from '../../services/teknisi.service';

export interface AssignmentTicket {
  no: number;
  idTicket: string;
  reportedBy: string;
  idKategori: number;
  kategori: string;
  subKategori: string;
  asset: string;
  tanggal: string;
  teknisiTerpilih: number | null;
  teknisiOptions: TeknisiOption[];
  loadingTeknisi: boolean;
  prioritas?: 'Low' | 'Normal' | 'Urgent';
  deadline?: string | null;
}

@Component({
  selector: 'app-assignment-ticket',
  templateUrl: './assignment.page.html',
  styleUrls: ['./assignment.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonIcon, IonSelect, IonSelectOption],
})
export class AssignmentTicketPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'assignment-ticket';

  // ===== TIKET BARU (Assignable) =====
  tickets: AssignmentTicket[] = [];
  
  // 🔥 TIKET KEMBALI (Returned)
  returnedTickets: any[] = [];

  isLoading = false;
  errorMessage = '';

  searchTerm = '';
  filterKategori = '';
  
  // 🔥 Filter Status
  filterStatus: 'assignable' | 'returned' = 'assignable';

  kategoriOptions: string[] = [];

  currentPage = 1;
  pageSize = 10;

  constructor(
    private router: Router,
    private assignmentService: AssignmentService,
    private ticketService: TicketService // 🔥 Inject TicketService
  ) {}

  ngOnInit() {
    this.loadAssignableTickets();
    this.loadReturnedTickets();
  }

  loadAssignableTickets() {
    this.isLoading = true;
    this.errorMessage = '';

    this.assignmentService.getAssignableTickets().subscribe({
      next: (res: any) => {
        const rows = res?.data || [];
        this.tickets = rows.map((row: any, index: number): AssignmentTicket => ({
          no: index + 1,
          idTicket: row.id_ticket,
          reportedBy: row.reported,
          idKategori: row.id_kategori,
          kategori: row.kategori,
          subKategori: row.sub_kategori,
          asset: row.asset,
          tanggal: row.tanggal,
          teknisiTerpilih: null,
          teknisiOptions: [],
          loadingTeknisi: false,
          prioritas: row.prioritas || row.priority || 'Normal',
          deadline: row.deadline || null,
        }));
        
        this.buildFilterOptions();
        this.isLoading = false;

        this.tickets.forEach((t) => this.loadTeknisiForTicket(t));
      },
      error: (err: any) => {
        console.error('Gagal memuat tiket assignment:', err);
        this.errorMessage = 'Gagal memuat data tiket.';
        this.isLoading = false;
      }
    });
  }

  // 🔥 Load tiket yang dikembalikan
  loadReturnedTickets() {
    this.ticketService.getReturnedTickets().subscribe({
      next: (res) => {
        this.returnedTickets = res?.data || [];
      },
      error: (err) => {
        console.error('Gagal load returned tickets', err);
      }
    });
  }

  loadTeknisiForTicket(ticket: AssignmentTicket) {
    ticket.loadingTeknisi = true;
    this.assignmentService.getTeknisiByKategori(ticket.idKategori).subscribe({
      next: (res: any) => {
        ticket.teknisiOptions = Array.isArray(res) ? res : (res?.data || []);
        ticket.loadingTeknisi = false;
      },
      error: (err: any) => {
        console.error(`Gagal memuat teknisi untuk tiket ${ticket.idTicket}:`, err);
        ticket.loadingTeknisi = false;
      }
    });
  }

  private buildFilterOptions() {
    this.kategoriOptions = [...new Set(this.tickets.map((t) => t.kategori))];
  }

  // 🔥 Logic filter utama
  get filteredTickets(): any[] {
    if (this.filterStatus === 'assignable') {
      const term = this.searchTerm.trim().toLowerCase();
      return this.tickets.filter((t) => {
        const matchSearch =
          !term ||
          t.idTicket.toLowerCase().includes(term) ||
          t.reportedBy.toLowerCase().includes(term);
        const matchKategori = !this.filterKategori || t.kategori === this.filterKategori;
        return matchSearch && matchKategori;
      });
    } else {
      const term = this.searchTerm.trim().toLowerCase();
      return this.returnedTickets.filter((t: any) => {
        const matchSearch =
          !term ||
          t.id_ticket?.toLowerCase().includes(term) ||
          t.reported?.toLowerCase().includes(term);
        return matchSearch;
      });
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTickets.length / this.pageSize));
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedTickets(): any[] {
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

  // 🔥 Helper untuk badge CSS prioritas
  getPrioritasClass(prioritas: string): string {
    const p = prioritas?.toLowerCase() || 'normal';
    if (p === 'low') return 'prioritas-low';
    if (p === 'urgent') return 'prioritas-urgent';
    return 'prioritas-normal';
  }

  // 🔥 Admin: Assign biasa
  onAssign(ticket: AssignmentTicket) {
    if (!ticket.teknisiTerpilih) {
      alert(`Silakan pilih teknisi terlebih dahulu untuk ticket ${ticket.idTicket}!`);
      return;
    }

    this.assignmentService.assignTicket(ticket.idTicket, ticket.teknisiTerpilih, ticket.prioritas).subscribe({
      next: () => {
        alert(`Tiket ${ticket.idTicket} berhasil di-assign dengan prioritas ${ticket.prioritas}!`);
        this.loadAssignableTickets();
      },
      error: (err: any) => {
        console.error('Gagal assign tiket:', err);
        alert(err?.error?.message || 'Gagal assign tiket.');
      }
    });
  }

  // 🔥 Admin: Review pengembalian (Approve / Reject)
  reviewReturn(ticket: any, action: 'Approve' | 'Reject') {
    if (!confirm(`${action === 'Approve' ? 'Setujui' : 'Tolak'} pengembalian tiket ${ticket.id_ticket}?`)) return;

    this.ticketService.reviewReturn(ticket.id_ticket, action).subscribe({
      next: () => {
        alert(`Pengembalian ${action === 'Approve' ? 'disetujui' : 'ditolak'}.`);
        this.loadReturnedTickets(); // refresh
      },
      error: (err) => alert(err?.error?.message || 'Gagal memproses review.')
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

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
  goToSchedule() { this.setActiveMenu('schedule'); this.router.navigate(['/schedule']); } // 🛠️ Ditambahkan untuk mengatasi error TS2339
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