import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FeedbackService, FeedbackReport } from '../../services/feedback.service';

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

  // ===== DATA DARI DATABASE =====
  feedbackList: FeedbackReport[] = [];

  // ==== FILTER ====
  searchTerm = '';
  filterRating = '';

  ratingOptions: string[] = ['Positif', 'Negatif'];

  // ==== PAGINATION ====
  currentPage = 1;
  pageSize = 10;

  constructor(private router: Router, private feedbackService: FeedbackService) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadFeedback();
  }

  loadFeedback() {
    this.feedbackService.getAll().subscribe({
      next: (res: any) => {
        // Menangani struktur response baik berupa array langsung maupun dibungkus objek { data: [...] }
        const rawData = res.data || res;
        if (Array.isArray(rawData)) {
          this.feedbackList = rawData.map((item: any) => ({
            idTicket: item.id_ticket,
            reportedBy: item.reported || item.nik_pelapor || '-',
            tanggal: item.tanggal,
            feedback: item.feedback,
            keterangan: item.keterangan || '-'
          }));
        }
      },
      error: (err) => {
        console.error('Gagal mengambil data dari database:', err);
      }
    });
  }

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
  toggleSidebar() { 
    this.isSidebarOpen = !this.isSidebarOpen; 
  }

  setActiveMenu(menu: string) { 
    this.activeMenu = menu; 
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }

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
  
  goToLaporanFeedback() {
    this.setActiveMenu('laporan-feedback');
    this.router.navigate(['/laporan-feedback']); 
  }
  goToStatistikTicket() { this.setActiveMenu('statistik-ticket'); this.router.navigate(['/statistik-ticket']); }
  goToProfile() { this.setActiveMenu('profile'); this.router.navigate(['/profile']); }
  goToNotifikasi() { this.setActiveMenu('notifikasi'); }
}