import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular/standalone';

export interface AssignmentTicket {
  no: number;
  idTicket: string;
  reportedBy: string;
  kategori: string;
  subKategori: string;
  asset: string;
  tanggal: string;
  teknisiTerpilih: string;
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

  // ==== DATA TICKET (Dummy sesuai permintaan Anda) ====
  tickets: AssignmentTicket[] = [
    {
      no: 1,
      idTicket: 'T202612020001',
      reportedBy: 'Desi',
      kategori: 'Hardware',
      subKategori: 'Kerusakan monitor',
      asset: 'AST-0001',
      tanggal: '02-12-2026',
      teknisiTerpilih: '',
    },
    {
      no: 2,
      idTicket: 'T202612020002',
      reportedBy: 'Yulita',
      kategori: 'Hardware',
      subKategori: 'Kerusakan komponen monitor',
      asset: 'AST-0002',
      tanggal: '02-12-2026',
      teknisiTerpilih: '',
    },
  ];

  // ==== DATA TEKNISI (Dummy) ====
  // Dalam skenario nyata, data ini akan diambil dari API berdasarkan kategori Hardware/Software
  teknisiOptions: string[] = [
    'Muhlison (Hardware)',
    'Rian (Hardware)',
    'Andi (Software)',
    'Budi (Jaringan)',
    'Citra (Hardware)',
  ];

  // ==== FILTER ====
  searchTerm = '';
  filterKategori = '';
  
  kategoriOptions: string[] = [];

  // ==== PAGINATION ====
  currentPage = 1;
  pageSize = 10;

  constructor(private router: Router) {}

  ngOnInit() {
    this.buildFilterOptions();
  }

  private buildFilterOptions() {
    this.kategoriOptions = [...new Set(this.tickets.map((t) => t.kategori))];
  }

  // ===== LOGIKA FILTER & PAGINATION =====
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

  // ===== FUNGSI AKSI ASSIGN =====
  onAssign(ticket: AssignmentTicket) {
    if (!ticket.teknisiTerpilih) {
      alert(`Silakan pilih teknisi terlebih dahulu untuk ticket ${ticket.idTicket}!`);
      return;
    }
    console.log(`🔧 Tiket ${ticket.idTicket} di-assign ke ${ticket.teknisiTerpilih}.`);
    alert(`Tiket ${ticket.idTicket} berhasil di-assign ke ${ticket.teknisiTerpilih}!`);
    // TODO: Panggil API untuk assign ticket di sini
  }

  // ===== NAVIGASI & SIDEBAR =====
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