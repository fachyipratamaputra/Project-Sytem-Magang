import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export interface FeedbackReport {
  idTicket: string;
  reportedBy: string;
  tanggal: string;
  feedback: string;
  keterangan: string;
}

@Component({
  selector: 'app-laporan-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class LaporanFeedbackPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'laporan-feedback';

  // ===== DATA LAPORAN FEEDBACK =====
  feedbackList: FeedbackReport[] = [
    {
      idTicket: 'T202612020001',
      reportedBy: 'DESI',
      tanggal: '2026-12-02 16:59:02',
      feedback: 'Positif',
      keterangan: 'Teknisi sangat cepat tanggap dan profesional dalam menangani masalah monitor.',
    },
    {
      idTicket: 'T202612020002',
      reportedBy: 'Dewi',
      tanggal: '2026-12-02 16:44:45',
      feedback: 'Negatif',
      keterangan: 'Proses perbaikan terlalu lambat, memakan waktu hingga 3 hari kerja.',
    },
    {
      idTicket: 'T202612020003',
      reportedBy: 'Yulita',
      tanggal: '2026-12-02 16:44:45',
      feedback: 'Positif',
      keterangan: 'Masalah software sudah terselesaikan dengan baik, terima kasih atas bantuan tim IT.',
    },
  ];

  // ==== FILTER ====
  searchTerm = '';
  filterRating = '';

  ratingOptions: string[] = ['Positif', 'Negatif'];

  // ==== PAGINATION ====
  currentPage = 1;
  pageSize = 10;

  constructor(private router: Router) {}

  ngOnInit() {}

  // ===== LOGIKA FILTER & PAGINATION =====
  get filteredFeedback(): FeedbackReport[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.feedbackList.filter((f) => {
      const matchSearch =
        !term ||
        f.idTicket.toLowerCase().includes(term) ||
        f.reportedBy.toLowerCase().includes(term);
      const matchRating = !this.filterRating || f.feedback === this.filterRating;
      return matchSearch && matchRating;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredFeedback.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedFeedback(): FeedbackReport[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredFeedback.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ===== HELPER CSS CLASS =====
  getRatingClass(rating: string): string {
    if (rating === 'Positif') return 'feedback-positif';
    if (rating === 'Negatif') return 'feedback-negatif';
    return 'feedback-default';
  }

  // ===== NAVIGASI & SIDEBAR =====
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) { this.activeMenu = menu; }

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