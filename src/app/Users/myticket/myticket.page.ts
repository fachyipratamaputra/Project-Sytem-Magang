import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export interface MyTicket {
  id: string;
  kategori: string;
  subKategori: string;
  asset: string;
  lampiran: string;
  tanggal: string;
  status: 'Proses' | 'Solved' | 'Menunggu Approval';
}

@Component({
  selector: 'app-my-ticket',
  templateUrl: './myticket.page.html',
  styleUrls: ['./myticket.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class MyTicketPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'my-ticket';

  user = {
    nama: 'User',
    role: 'users',
  };

  // ===== DATA TIKET SAYA (Dummy) =====
  myTickets: MyTicket[] = [
    {
      id: 'T202612020001',
      kategori: 'Hardware',
      subKategori: 'Kerusakan monitor',
      asset: 'AST-0001',
      lampiran: 'foto',
      tanggal: '02-12-2026',
      status: 'Solved',
    },
    {
      id: 'T202612020002',
      kategori: 'Software',
      subKategori: 'Aplikasi error',
      asset: '-',
      lampiran: 'foto',
      tanggal: '03-12-2026',
      status: 'Proses',
    },
  ];

  // ===== DATA DROPDOWN FORM =====
  kategoriOptions = ['Hardware', 'Software', 'Jaringan', 'Printer', 'Email', 'Server'];
  
  // Mapping sub kategori berdasarkan kategori (dummy)
  subKategoriMap: { [key: string]: string[] } = {
    'Hardware': ['Kerusakan monitor', 'Kerusakan laptop', 'Keyboard rusak', 'Mouse tidak berfungsi'],
    'Software': ['Aplikasi error', 'Tidak bisa login', 'Crash saat dibuka'],
    'Jaringan': ['LAN putus', 'WiFi tidak stabil', 'Tidak bisa akses internet'],
    'Printer': ['Tinta habis', 'Paper jam', 'Tidak mau mencetak'],
    'Email': ['Lupa password', 'Tidak bisa login', 'Email tidak terkirim'],
    'Server': ['Server down', 'Database error'],
  };

  // ===== STATE MODAL =====
  isModalOpen = false;
  formData: any = {
    kategori: '',
    subKategori: '',
    asset: '',
    deskripsi: '',
    lampiran: '',
  };

  // ===== FILTER & PAGINATION =====
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  constructor(private router: Router) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'User';
      } catch (e) {}
    }
  }

  get filteredTickets(): MyTicket[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.myTickets;
    return this.myTickets.filter(t => 
      t.id.toLowerCase().includes(term) || 
      t.kategori.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTickets.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedTickets(): MyTicket[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTickets.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ===== FUNGSI MODAL TAMBAH TIKET =====
  openTambahModal() {
    this.formData = { kategori: '', subKategori: '', asset: '', deskripsi: '', lampiran: '' };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanTiket() {
    if (!this.formData.kategori || !this.formData.subKategori || !this.formData.deskripsi) {
      alert('Kategori, Sub Kategori, dan Deskripsi wajib diisi!');
      return;
    }

    // Generate ID Ticket Otomatis
    let nextNum = 1;
    if (this.myTickets.length > 0) {
      const lastId = this.myTickets[this.myTickets.length - 1].id;
      const numPart = lastId.replace('T', '');
      nextNum = parseInt(numPart, 10) + 1;
    }
    const newId = 'T' + String(nextNum).padStart(12, '0');

    const now = new Date();
    const tanggal = now.getDate().toString().padStart(2, '0') + '-' +
                    (now.getMonth() + 1).toString().padStart(2, '0') + '-' +
                    now.getFullYear();

    const newTicket: MyTicket = {
      id: newId,
      kategori: this.formData.kategori,
      subKategori: this.formData.subKategori,
      asset: this.formData.asset || '-',
      lampiran: this.formData.lampiran || '-',
      tanggal: tanggal,
      status: 'Menunggu Approval', // Default status
    };

    this.myTickets.unshift(newTicket); // Tambahkan ke paling atas
    this.closeModal();
    alert('Tiket berhasil dikirim! Menunggu approval dari Admin.');
  }

  // ===== NAVIGASI =====
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }

  goToDashboardUser() { this.setActiveMenu('dashboard-user'); this.router.navigate(['/users/dashboard']); }
  goToMyTicket() { this.setActiveMenu('my-ticket'); this.router.navigate(['/users/my-ticket']); }
  goToInputAset() { this.setActiveMenu('input-aset'); this.router.navigate(['/users/input-aset']); }
  goToLaporanFeedback() { this.setActiveMenu('laporan-feedback'); this.router.navigate(['/users/feedback']); }
  goToPengaturan() { this.setActiveMenu('pengaturan'); }
  goToProfile() { this.setActiveMenu('profile'); }

  getPageTitle(): string { return 'My Ticket'; }

  getStatusClass(status: string): string {
    if (status === 'Solved') return 'status-selesai';
    if (status === 'Proses') return 'status-proses';
    if (status === 'Menunggu Approval') return 'status-waiting';
    return 'status-default';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}