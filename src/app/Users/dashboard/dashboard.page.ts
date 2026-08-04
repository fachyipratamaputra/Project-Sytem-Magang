import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonBadge, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-users-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon, IonSpinner],
})
export class UsersDashboardPage implements OnInit {
  
  isSidebarOpen = false;
  isLoading = false;
  activeMenu = 'dashboard-user';

  // Data user (diambil dari localStorage saat login)
  user = {
    nama: 'Desi',
    role: 'users',
  };

  // Data statistik (dummy)
  totalTicket = 5;
  onProgress = 2;
  closedTicket = 3;

  // Data daftar ticket milik user (dummy)
  tickets = [
    {
      id: 'T202612020001',
      kategori: 'Hardware',
      subKategori: 'Kerusakan monitor',
      tanggal: '2026-12-02 16:59:02',
      status: 'Proses',
      progress: 75,
    },
    {
      id: 'T202612020002',
      kategori: 'Hardware',
      subKategori: 'Kerusakan komponen monitor',
      tanggal: '2026-12-02 16:44:45',
      status: 'Selesai',
      progress: 100,
    },
    {
      id: 'T202612020003',
      kategori: 'Software',
      subKategori: 'Aplikasi error',
      tanggal: '2026-12-02 16:44:45',
      status: 'Proses',
      progress: 30,
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Reset menu aktif setiap kali halaman dimuat (mencegah klik dua kali)
    this.activeMenu = 'dashboard-user';

    // Ambil data user dari localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'User';
        this.user.role = parsed.role || 'users';
      } catch (e) {
        // fallback
      }
    }
  }

  // ===== SIDEBAR TOGGLE =====
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) {
      this.isSidebarOpen = false;
    }
  }

  // ===== NAVIGASI =====
  goToDashboardUser() {
    this.setActiveMenu('dashboard-user');
    this.router.navigate(['/users/dashboard']);
  }

  goToMyTicket() {
    this.setActiveMenu('my-ticket');
    this.router.navigate(['/users/my-ticket']);
  }

  goToInputAset() {
    this.setActiveMenu('input-aset');
    this.router.navigate(['/users/input-aset']);
  }

  goToLaporanFeedback() {
    this.setActiveMenu('laporan-feedback');
    this.router.navigate(['/users/feedback']);
  }

  goToPengaturan() {
    this.setActiveMenu('pengaturan');
  }

  goToProfile() {
    this.setActiveMenu('profile');
  }

  // ===== HELPER =====
  getPageTitle(): string {
    const titles: Record<string, string> = {
      'dashboard-user': 'Dashboard User',
      'my-ticket': 'My Ticket',
      'input-aset': 'Input Aset',
      'laporan-feedback': 'Laporan Feedback',
      'pengaturan': 'Pengaturan',
    };
    return titles[this.activeMenu] ?? 'Dashboard User';
  }

  getPageSubtitle(): string {
    return `Selamat datang, ${this.user.nama} 👋`;
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s === 'proses') return 'status-proses';
    if (s === 'selesai') return 'status-selesai';
    return 'status-default';
  }

  getProgressClass(progress: number): string {
    if (progress >= 100) return 'progress-complete';
    if (progress >= 70) return 'progress-advanced';
    if (progress >= 30) return 'progress-medium';
    return 'progress-low';
  }

  // ===== LOGOUT =====
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}