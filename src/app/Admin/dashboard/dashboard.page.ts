import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonBadge, IonSpinner } from '@ionic/angular/standalone';
import Chart from 'chart.js/auto';

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
  imports: [CommonModule, IonContent, IonButton, IonIcon, IonBadge, IonSpinner],
})
export class DashboardPage implements OnInit, AfterViewInit {
  @ViewChild('ticketChart') ticketChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('feedbackChart') feedbackChartRef!: ElementRef<HTMLCanvasElement>;

  isSidebarOpen = false;
  isLoading = false;
  activeMenu = 'dashboard';

  user = {
    nama: 'Admin',
    role: 'admin',
  };

  pendingCount = 3;

  totalTicket = 250;
  totalTicketTrend = 12;

  waitingApproval = 10;
  waitingApprovalTrend = 5;

  onProgress = 25;
  onProgressTrend = 15;

  closedTicket = 215;
  closedTicketTrend = 10;

  totalUser = 120;
  totalTeknisi = 12;
  totalAsset = 320;

  feedbackPositifPercent = 92;
  feedbackPositifTrend = 8;
  feedbackNegatifPercent = 8;

  chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  chartTotal = [65, 72, 68, 75, 82, 78, 85, 80, 88, 92, 85, 90];
  chartClosed = [55, 60, 58, 65, 70, 68, 72, 70, 75, 78, 74, 80];
  chartOnProgress = [20, 25, 22, 28, 30, 26, 32, 28, 35, 33, 30, 34];
  chartWaitingApproval = [8, 10, 9, 12, 10, 11, 13, 10, 14, 12, 11, 10];

  activities: Activity[] = [
    { icon: 'add-circle-outline', type: 'info', text: 'Desi membuat ticket baru', time: '25 Jul 2026 09:15' },
    { icon: 'checkmark-circle-outline', type: 'success', text: 'Muhlison menyelesaikan ticket T20260725012', time: '25 Jul 2026 11:20' },
    { icon: 'happy-outline', type: 'success', text: 'Dewi memberikan feedback positif', time: '25 Jul 2026 11:35' },
    { icon: 'person-add-outline', type: 'warning', text: 'Ticket T20260725010 di-assign ke Rian', time: '25 Jul 2026 10:05' },
    { icon: 'add-circle-outline', type: 'info', text: 'Yulita membuat ticket baru', time: '25 Jul 2026 09:40' },
  ];

  private lineChart?: Chart;
  private donutChart?: Chart;

  constructor(private router: Router) {}

  ngOnInit() {
    this.activeMenu = 'dashboard';
  }

  ngAfterViewInit() {
    this.renderTicketChart();
    this.renderFeedbackChart();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) {
      this.isSidebarOpen = false;
    }
  }

  goToDashboard() { 
    this.setActiveMenu('dashboard'); 
    this.router.navigate(['/dashboard']); 
  }

  goToListTicket() { 
    this.setActiveMenu('list-ticket'); 
    this.router.navigate(['/list']); 
  }

  goToApprovalTicket() { 
    this.setActiveMenu('approval-ticket'); 
    this.router.navigate(['/approval']); 
  }

  goToAssignmentTicket() { 
    this.setActiveMenu('assignment-ticket'); 
    this.router.navigate(['/assignment']); 
  }

  goToKaryawan() { 
    this.setActiveMenu('karyawan'); 
    this.router.navigate(['/karyawan']); 
  }

  goToUser() { 
    this.setActiveMenu('user'); 
    this.router.navigate(['/users']); 
  }

  goToJabatan() { 
    this.setActiveMenu('jabatan'); 
    this.router.navigate(['/jabatan']); 
  }

  goToDepartemen() { 
    this.setActiveMenu('departemen'); 
    this.router.navigate(['/departemen']); 
  }

  goToBagianDepartemen() { 
    this.setActiveMenu('bagian-departemen'); 
    this.router.navigate(['/bagian-departemen']); 
  }

  goToKategori() { 
    this.setActiveMenu('kategori'); 
    this.router.navigate(['/kategori']); 
  }

  goToSubKategori() { 
    this.setActiveMenu('sub-kategori'); 
    this.router.navigate(['/sub-kategori']); 
  }

  goToTeknisi() { 
    this.setActiveMenu('teknisi'); 
    this.router.navigate(['/teknisi']); 
  }

  goToInventory() { 
    this.setActiveMenu('inventory'); 
    this.router.navigate(['/inventory']); 
  }

  goToLaporanFeedback() {
    this.setActiveMenu('laporan-feedback');
    this.router.navigate(['/laporan-feedback']); 
  }

  goToStatistikTicket() { 
    this.setActiveMenu('statistik-ticket'); 
  }

  goToProfile() { 
    this.setActiveMenu('profile'); 
  }

  goToNotifikasi() { 
    this.setActiveMenu('notifikasi'); 
  }

  logout() {
    this.router.navigate(['/login']);
  }

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

  private renderTicketChart() {
    if (!this.ticketChartRef) return;
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
    this.donutChart = new Chart(this.feedbackChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Positif', 'Negatif'],
        datasets: [{ data: [this.feedbackPositifPercent, this.feedbackNegatifPercent], backgroundColor: ['#22c55e', '#ef4444'], borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: { legend: { display: false } },
      },
    });
  }
}