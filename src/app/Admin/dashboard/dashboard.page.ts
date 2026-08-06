import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; 
import { IonContent, IonButton, IonIcon, IonBadge, IonSpinner } from '@ionic/angular/standalone';
import Chart from 'chart.js/auto';
import { DashboardService } from '../../services/dashboard.service'; // Import Service baru

interface Activity {
  icon: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  text: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, IonContent, IonButton, IonIcon, IonBadge, IonSpinner],
  providers: [DashboardService]
})
export class DashboardPage implements OnInit, AfterViewInit {
  @ViewChild('ticketChart') ticketChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('feedbackChart') feedbackChartRef!: ElementRef<HTMLCanvasElement>;

  isSidebarOpen = false;
  isLoading = true; // Ubah jadi true agar memuat loading dulu
  activeMenu = 'dashboard';

  user = {
    nama: 'Admin',
    role: 'admin',
  };

  pendingCount = 0;

  // Data Statistik (akan diisi dari API)
  totalTicket = 0;
  totalTicketTrend = 0;

  waitingApproval = 0;
  waitingApprovalTrend = 0;

  onProgress = 0;
  onProgressTrend = 0;

  closedTicket = 0;
  closedTicketTrend = 0;

  totalUser = 0;
  totalTeknisi = 0;
  totalAsset = 0;

  feedbackPositifPercent = 0;
  feedbackPositifTrend = 0;
  feedbackNegatifPercent = 0;

  // Data Grafik
  chartLabels: string[] = [];
  chartTotal: number[] = [];
  chartClosed: number[] = [];
  chartOnProgress: number[] = [];
  chartWaitingApproval: number[] = [];

  // Data Aktivitas
  activities: Activity[] = [];

  private lineChart?: Chart;
  private donutChart?: Chart;

  constructor(
    private router: Router,
    private dashboardService: DashboardService // Inject Service
  ) {}

  ngOnInit() {
    this.activeMenu = 'dashboard';
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Chart akan dirender setelah data API diterima di loadDashboardData
  }

  // 🔥 AMBIL DATA DARI BACKEND
  loadDashboardData() {
    this.isLoading = true;
    this.dashboardService.getAdminDashboard().subscribe({
      next: (res: any) => {
        const data = res.data;

        // 1. Mapping Data Statistik
        const summary = data.summary || {};
        this.totalTicket = summary.total_tiket || 0;
        this.waitingApproval = summary.waiting_approval || 0;
        this.onProgress = summary.on_progress || 0;
        this.closedTicket = summary.solved || 0;
        this.totalUser = summary.total_user || 0;
        this.totalTeknisi = summary.total_teknisi || 0;
        this.totalAsset = summary.total_asset || 0;
        this.pendingCount = this.waitingApproval;

        // 2. Mapping Data Grafik Bulanan (Bisa dihitung manual jika tabel v_dashboard_summary belum ada)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const currentYear = new Date().getFullYear();
        
        // Inisialisasi array kosong 12 bulan
        let totals = Array(12).fill(0);
        let closed = Array(12).fill(0);
        let progress = Array(12).fill(0);
        let waiting = Array(12).fill(0);

        // Isi data dari API (Jika API mengembalikan data per bulan dalam format 'YYYY-MM')
        const tiketBulanan = data.tiketBulanan || [];
        tiketBulanan.forEach((item: any) => {
          const [year, month] = item.bulan.split('-');
          // Hanya ambil data tahun ini agar grafik tidak campur tahun lalu
          if (parseInt(year) === currentYear) {
            const index = parseInt(month) - 1;
            // 📌 Catatan: Backend controller Anda hanya mengirim total (`jumlah`). 
            // Untuk grafik Closed/On Progress/Waiting, Anda perlu update controller agar mengirim 4 dataset.
            // Untuk sementara, kita set semua garis menjadi data total yang sama agar grafik muncul.
            totals[index] = item.jumlah || 0;
            closed[index] = Math.floor(item.jumlah * 0.7) || 0; // Dummy sementara
            progress[index] = Math.floor(item.jumlah * 0.2) || 0;
            waiting[index] = Math.floor(item.jumlah * 0.1) || 0;
          }
        });

        this.chartLabels = months;
        this.chartTotal = totals;
        this.chartClosed = closed;
        this.chartOnProgress = progress;
        this.chartWaitingApproval = waiting;

        // 3. Mapping Aktivitas Terbaru
        const aktivitas = data.aktivitasTerbaru || [];
        this.activities = aktivitas.map((item: any) => ({
          icon: this.getActivityIcon(item.status),
          type: this.getActivityType(item.status),
          text: `${item.reported} ${this.getActivityText(item.status)}`,
          time: this.formatWaktuRelatif(item.tanggal_lapor)
        }));

        this.isLoading = false;
        this.renderTicketChart();
        this.renderFeedbackChart();
      },
      error: (err: any) => {
        console.error('Gagal memuat dashboard', err);
        this.isLoading = false;
        alert('Gagal mengambil data dashboard. Pastikan tabel v_dashboard_summary ada di database.');
      }
    });
  }

  // ===== HELPER UNTUK AKTIVITAS =====
  getActivityIcon(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('solved') || s.includes('selesai')) return 'checkmark-circle-outline';
    if (s.includes('approve')) return 'checkmark-done-outline';
    if (s.includes('process') || s.includes('proses')) return 'construct-outline';
    if (s.includes('menunggu')) return 'hourglass-outline';
    return 'add-circle-outline';
  }

  getActivityType(status: string): 'info' | 'success' | 'warning' | 'danger' {
    const s = (status || '').toLowerCase();
    if (s.includes('solved') || s.includes('selesai')) return 'success';
    if (s.includes('process') || s.includes('proses')) return 'warning';
    if (s.includes('reject')) return 'danger';
    return 'info';
  }

  getActivityText(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('solved') || s.includes('selesai')) return 'menyelesaikan ticket';
    if (s.includes('approve')) return 'menyetujui ticket';
    if (s.includes('process') || s.includes('proses')) return 'memproses ticket';
    if (s.includes('menunggu')) return 'mengirim ticket baru';
    return 'melakukan aktivitas';
  }

  formatWaktuRelatif(dateStr: string): string {
    if (!dateStr) return '-';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} hari lalu`;
    if (diffHours > 0) return `${diffHours} jam lalu`;
    return 'Baru saja';
  }

  // ===== CHART RENDER =====
  private renderTicketChart() {
    if (!this.ticketChartRef) return;
    // Hancurkan chart lama jika ada untuk mencegah error canvas ganda
    if (this.lineChart) {
      this.lineChart.destroy();
    }

    this.lineChart = new Chart(this.ticketChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.chartLabels,
        datasets: [
          { label: 'Total', data: this.chartTotal, borderColor: '#3b82f6', backgroundColor: 'transparent', tension: 0.4, pointRadius: 3 },
          { label: 'Closed', data: this.chartClosed, borderColor: '#22c55e', backgroundColor: 'transparent', tension: 0.4, pointRadius: 3 },
          { label: 'On Progress', data: this.chartOnProgress, borderColor: '#f59e0b', backgroundColor: 'transparent', tension: 0.4, pointRadius: 3 },
          { label: 'Waiting Approval', data: this.chartWaitingApproval, borderColor: '#ef4444', backgroundColor: 'transparent', tension: 0.4, pointRadius: 3 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  private renderFeedbackChart() {
    if (!this.feedbackChartRef) return;
    if (this.donutChart) {
      this.donutChart.destroy();
    }

    // Dummy 92% untuk sementara, jika Anda punya tabel feedback, Anda bisa menghitungnya dari API
    const positif = 92;
    const negatif = 8;

    this.donutChart = new Chart(this.feedbackChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Positif', 'Negatif'],
        datasets: [{ data: [positif, negatif], backgroundColor: ['#22c55e', '#ef4444'], borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: { legend: { display: false } },
      },
    });
  }

  // ===== NAVIGASI =====
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
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
  goToLaporanFeedback() { this.setActiveMenu('laporan-feedback'); this.router.navigate(['/laporan-feedback']); }
  goToStatistikTicket() { this.setActiveMenu('statistik-ticket'); }
  goToProfile() { this.setActiveMenu('profile'); }
  goToNotifikasi() { this.setActiveMenu('notifikasi'); }

  logout() { this.router.navigate(['/login']); }

  getPageTitle(): string {
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'list-ticket': 'List Ticket',
      'approval-ticket': 'Approval Ticket',
      'assignment-ticket': 'Assignment Ticket',
      'karyawan': 'Karyawan',
      'user': 'User',
      'jabatan': 'Jabatan',
      'departemen': 'Departemen',
      'bagian-departemen': 'Bagian Departemen',
      'kategori': 'Kategori',
      'sub-kategori': 'Sub Kategori',
      'teknisi': 'Teknisi',
      'inventory': 'Inventory',
      'laporan-feedback': 'Laporan Feedback',
      'statistik-ticket': 'Statistik Ticket',
      'profile': 'Profile',
      'notifikasi': 'Notifikasi',
      'pengaturan': 'Pengaturan',
    };
    return titles[this.activeMenu] ?? 'Dashboard';
  }

  getPageSubtitle(): string {
    return `Selamat datang kembali, ${this.user.nama} 👋`;
  }
}