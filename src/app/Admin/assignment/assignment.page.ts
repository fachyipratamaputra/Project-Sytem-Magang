import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { AssignmentService } from '../../services/assignment.service ';
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
  // 🔥 Tambahan field prioritas & deadline
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

  tickets: AssignmentTicket[] = [];
  isLoading = false;
  errorMessage = '';

  searchTerm = '';
  filterKategori = '';
  kategoriOptions: string[] = [];

  currentPage = 1;
  pageSize = 10;

  constructor(
    private router: Router,
    private assignmentService: AssignmentService
  ) {}

  ngOnInit() {
    this.loadAssignableTickets();
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
          // 🔥 Ambil prioritas & deadline dengan pengecekan variasi key dari respons backend
          prioritas: row.prioritas || row.priority || row.PRIORITAS || row.Prioritas || 'Normal',
          deadline: row.deadline || row.DEADLINE || row.Deadline || null,
        }));
        
        this.buildFilterOptions();
        this.isLoading = false;

        // Panggil fetch teknisi untuk setiap tiket berdasarkan idKategori-nya
        this.tickets.forEach((t) => this.loadTeknisiForTicket(t));
      },
      error: (err: any) => {
        console.error('Gagal memuat tiket assignment:', err);
        this.errorMessage = 'Gagal memuat data tiket.';
        this.isLoading = false;
      }
    });
  }

  loadTeknisiForTicket(ticket: AssignmentTicket) {
    ticket.loadingTeknisi = true;
    console.log(`Mengambil teknisi untuk Kategori ID: ${ticket.idKategori} (Tiket: ${ticket.idTicket})`);

    this.assignmentService.getTeknisiByKategori(ticket.idKategori).subscribe({
      next: (res: any) => {
        console.log(`Respon teknisi untuk kategori ${ticket.idKategori}:`, res);
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

  get filteredTickets(): AssignmentTicket[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.tickets.filter((t) => {
      const matchSearch =
        !term ||
        t.idTicket.toLowerCase().includes(term) ||
        t.reportedBy.toLowerCase().includes(term);
      const matchKategori = !this.filterKategori || t.kategori === this.filterKategori;
      return matchSearch && matchKategori;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTickets.length / this.pageSize));
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedTickets(): AssignmentTicket[] {
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

  // 🔥 Helper untuk badge CSS prioritas (sesuai dengan Approval Ticket)
  getPrioritasClass(prioritas: string): string {
    const p = prioritas?.toLowerCase() || 'normal';
    if (p === 'low') return 'prioritas-low';
    if (p === 'urgent') return 'prioritas-urgent';
    return 'prioritas-normal';
  }

  onAssign(ticket: AssignmentTicket) {
    if (!ticket.teknisiTerpilih) {
      alert(`Silakan pilih teknisi terlebih dahulu untuk ticket ${ticket.idTicket}!`);
      return;
    }

    // 🔥 Kirim prioritas yang baru dipilih Admin ke Backend
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

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
  }

  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToListTicket() { this.router.navigate(['/list']); }
  goToApprovalTicket() { this.router.navigate(['/approval']); }
  goToAssignmentTicket() { this.activeMenu = 'assignment-ticket'; this.router.navigate(['/assignment']); }
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