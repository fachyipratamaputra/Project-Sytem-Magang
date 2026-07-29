import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonBadge, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-teknisi-dashboard',
  templateUrl: './dashborad.page.html',
  styleUrls: ['./dashborad.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon, IonBadge, IonSpinner],
})
export class TeknisiDashboardPage implements OnInit {
  
  isSidebarOpen = false;
  isLoading = false;
  activeMenu = 'dashboard-teknisi';

  // Data user teknisi (diambil dari localStorage saat login)
  user = {
    nama: 'Muhlison',
    role: 'teknisi',
  };

  // Data statistik (dummy)
  totalTicket = 12;
  onProgress = 5;
  closedTicket = 7;

  // Data daftar ticket yang di-assign ke teknisi ini
  tickets = [
    {
      id: 'T202612020001',
      reportedBy: 'DESI',
      kategori: 'Hardware',
      subKategori: 'Kerusakan monitor',
      tanggal: '2026-12-02 16:59:02',
      progress: 75,
      status: 'Proses',
      catatan: 'Sedang mengganti panel LCD'
    },
    {
      id: 'T202612020002',
      reportedBy: 'Dewi',
      kategori: 'Hardware',
      subKategori: 'Kerusakan komponen monitor',
      tanggal: '2026-12-02 16:44:45',
      progress: 100,
      status: 'Selesai',
      catatan: 'Monitor sudah berfungsi normal'
    },
    {
      id: 'T202612020003',
      reportedBy: 'Yulita',
      kategori: 'Software',
      subKategori: 'Aplikasi error',
      tanggal: '2026-12-02 16:44:45',
      progress: 30,
      status: 'Proses',
      catatan: 'Menunggu update patch dari vendor'
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Ambil data user dari localStorage saat login
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'Teknisi';
        this.user.role = parsed.role || 'teknisi';
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
  goToDashboardTeknisi() {
    this.setActiveMenu('dashboard-teknisi');
    this.router.navigate(['/teknisi/dashboard']);
  }

  goToTicket() {
    this.setActiveMenu('ticket');
    this.router.navigate(['/teknisi/ticket']);
  }

  goToProsesTiket() {
    this.setActiveMenu('proses-tiket');
    this.router.navigate(['/teknisi/proses']);
  }

  goToRiwayatTiket() {
    this.setActiveMenu('riwayat-tiket');
    this.router.navigate(['/teknisi/riwayat']);
  }

  goToPengaturan() {
    this.setActiveMenu('pengaturan');
  }

  goToProfile() {
    this.setActiveMenu('profile');
  }

  // ===== HELPER UNTUK JUDUL HALAMAN =====
  getPageTitle(): string {
    const titles: Record<string, string> = {
      'dashboard-teknisi': 'Dashboard Teknisi',
      'ticket': 'Ticket',
      'proses-tiket': 'Proses Tiket',
      'riwayat-tiket': 'Riwayat Tiket',
      'pengaturan': 'Pengaturan',
    };
    return titles[this.activeMenu] ?? 'Dashboard Teknisi';
  }

  getPageSubtitle(): string {
    return `Selamat datang, Teknisi ${this.user.nama} 👋`;
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