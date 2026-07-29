import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export interface User {
  id: number;
  username: string;
  nama: string;
  departemen: string;
  level: string;
  password?: string; // tidak disimpan di list, hanya untuk modal
}

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class UsersPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'user';

  // ===== DATA USER (dummy) =====
  userList: User[] = [
    { id: 1, username: 'K0003', nama: 'DESI', departemen: 'IT', level: 'Admin' },
    { id: 2, username: 'K0004', nama: 'Dewi', departemen: 'IT', level: 'Teknisi' },
    { id: 3, username: 'K0005', nama: 'Yulita', departemen: 'IT', level: 'Users' },
  ];

  // ==== STATISTIK =====
  get totalUsers() { return this.userList.length; }
  get totalAdmin() { return this.userList.filter(u => u.level === 'Admin').length; }
  get totalTeknisi() { return this.userList.filter(u => u.level === 'Teknisi').length; }
  get totalUsersLevel() { return this.userList.filter(u => u.level === 'Users').length; }

  // ==== FILTER ====
  searchTerm = '';
  filterLevel = '';
  filterDepartemen = '';
  levelOptions: string[] = [];
  departemenOptions: string[] = [];

  // ==== PAGINATION ====
  currentPage = 1;
  pageSize = 10;

  // ==== STATE MODAL ====
  isModalOpen = false;
  isEditing = false;
  selectedId: number | null = null;
  formData: any = {
    nama: '',
    departemen: '',
    level: 'Users',
    password: '',
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.buildFilterOptions();
  }

  private buildFilterOptions() {
    this.levelOptions = [...new Set(this.userList.map((u) => u.level))];
    this.departemenOptions = [...new Set(this.userList.map((u) => u.departemen))];
  }

  // ===== LOGIKA FILTER & PAGINATION =====
  get filteredUsers(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.userList.filter((u) => {
      const matchSearch = !term || u.nama.toLowerCase().includes(term) || u.username.toLowerCase().includes(term);
      const matchLevel = !this.filterLevel || u.level === this.filterLevel;
      const matchDept = !this.filterDepartemen || u.departemen === this.filterDepartemen;
      return matchSearch && matchLevel && matchDept;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedUsers(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ===== FUNGSI MODAL =====
  openTambahModal() {
    this.isEditing = false;
    this.selectedId = null;
    this.formData = { nama: '', departemen: '', level: 'Users', password: '' };
    this.isModalOpen = true;
  }

  openEditModal(u: User) {
    this.isEditing = true;
    this.selectedId = u.id;
    this.formData = { ...u, password: '' }; // password tidak ditampilkan saat edit
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanUser() {
    if (!this.formData.nama || !this.formData.departemen || !this.formData.level) {
      alert('Nama, Departemen, dan Level wajib diisi!');
      return;
    }
    if (!this.isEditing && !this.formData.password) {
      alert('Password wajib diisi untuk user baru!');
      return;
    }

    if (this.isEditing && this.selectedId !== null) {
      // Update data (password tidak diubah jika kosong)
      const index = this.userList.findIndex(u => u.id === this.selectedId);
      if (index !== -1) {
        const updated = { ...this.userList[index], ...this.formData };
        if (!updated.password) delete updated.password; // jangan simpan password kosong
        this.userList[index] = updated;
      }
    } else {
      // Tambah data baru
      const newId = Math.max(...this.userList.map(u => u.id), 0) + 1;
      const username = 'U' + String(newId).padStart(4, '0'); // contoh U0004
      const newUser: User = {
        id: newId,
        username: username,
        nama: this.formData.nama,
        departemen: this.formData.departemen,
        level: this.formData.level,
        password: this.formData.password,
      };
      this.userList.push(newUser);
    }

    this.buildFilterOptions();
    this.closeModal();
    alert(this.isEditing ? 'Data user berhasil diperbarui!' : 'User berhasil ditambahkan!');
  }

  hapusUser(u: User) {
    if (confirm(`Apakah Anda yakin ingin menghapus user ${u.nama}?`)) {
      this.userList = this.userList.filter(item => item.id !== u.id);
      this.buildFilterOptions();
      this.onFilterChange();
    }
  }

  // ===== HELPER =====
  getLevelClass(level: string): string {
    const l = level.toLowerCase();
    if (l === 'admin') return 'level-admin';
    if (l === 'teknisi') return 'level-teknisi';
    if (l === 'users') return 'level-users';
    return 'level-default';
  }

  // ===== NAVIGASI & SIDEBAR =====
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) { this.activeMenu = menu; }

  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToListTicket() { this.router.navigate(['/list']); }
  goToApprovalTicket() { this.router.navigate(['/approval']); }
  goToAssignmentTicket() { this.router.navigate(['/assignment']); }
  goToKaryawan() { this.router.navigate(['/karyawan']); }
  goToUser() { this.activeMenu = 'user'; this.router.navigate(['/users']); }
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