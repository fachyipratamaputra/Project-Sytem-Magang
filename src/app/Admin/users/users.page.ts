import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { KaryawanService, AvailableKaryawan } from '../../services/karyawan.service';

export interface User {
  id_user?: number;
  id?: number;
  username: string;
  nama: string;
  departemen: string;
  level: string;
  status?: string;
  nik?: string;
  password?: string;
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

  userList: User[] = [];
  departemenMasterList: any[] = [];
  availableKaryawan: AvailableKaryawan[] = []; // 🔥 Data dropdown

  get totalUsers() { return this.userList.length; }
  get totalAdmin() { return this.userList.filter(u => u.level && u.level.toLowerCase() === 'admin').length; }
  get totalTeknisi() { return this.userList.filter(u => u.level && u.level.toLowerCase() === 'teknisi').length; }
  get totalUsersLevel() { return this.userList.filter(u => u.level && u.level.toLowerCase() === 'users').length; }

  searchTerm = '';
  filterLevel = '';
  filterDepartemen = '';
  levelOptions: string[] = ['Admin', 'Teknisi', 'Users'];
  
  get departemenOptions(): string[] {
    const fromMaster = this.departemenMasterList.map(d => d.nama_departemen);
    const fromUsers = this.userList.map(u => u.departemen);
    return [...new Set([...fromMaster, ...fromUsers])].filter(Boolean);
  }

  currentPage = 1;
  pageSize = 10;

  isModalOpen = false;
  isEditing = false;
  selectedId: number | null = null;
  formData: any = {
    nik: '',
    username: '',
    nama: '',
    departemen: '',
    level: 'Users',
    password: '',
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private karyawanService: KaryawanService // 🔥 Inject
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadDepartemenMaster();
  }

  loadUsers() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:5000/api/users', { headers }).subscribe({
      next: (res) => {
        if (res.success || Array.isArray(res.data) || Array.isArray(res)) {
          const rawData = res.success ? res.data : (res.data || res);
          this.userList = rawData.map((u: any) => ({
            ...u,
            id: u.id_user || u.id
          }));
        }
      },
      error: (err) => {
        console.error('Gagal memuat data user:', err);
        if (err.status === 403 || err.status === 401) {
          alert('Akses ditolak. Pastikan Anda login sebagai Admin!');
        }
      }
    });
  }

  loadDepartemenMaster() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:5000/api/departemen', { headers }).subscribe({
      next: (res) => {
        this.departemenMasterList = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => console.error('Gagal memuat master departemen untuk user:', err)
    });
  }

  // 🔥 Load data karyawan yang tersedia untuk dropdown
  loadAvailableKaryawan() {
    this.karyawanService.getAvailable().subscribe({
      next: (data) => {
        this.availableKaryawan = data;
      },
      error: (err) => console.error('Gagal memuat daftar karyawan tersedia:', err)
    });
  }

  // 🔥 Saat NIK dipilih, isi otomatis Nama dan Departemen
  onNikChange() {
    const selected = this.availableKaryawan.find(k => k.nik === this.formData.nik);
    if (selected) {
      this.formData.nama = selected.nama;
      this.formData.departemen = selected.departemen;
    } else {
      this.formData.nama = '';
      this.formData.departemen = '';
    }
  }

  get filteredUsers(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.userList.filter((u) => {
      const matchSearch = !term || (u.nama && u.nama.toLowerCase().includes(term)) || (u.username && u.username.toLowerCase().includes(term));
      const matchLevel = !this.filterLevel || u.level === this.filterLevel;
      const matchDept = !this.filterDepartemen || u.departemen === this.filterDepartemen;
      return matchSearch && matchLevel && matchDept;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }
  get totalPagesArray(): number[] { 
    return Array.from({ length: this.totalPages }, (_, i) => i + 1); 
  }
  get pagedUsers(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  openTambahModal() {
    this.isEditing = false;
    this.selectedId = null;
    this.formData = { 
      nik: '', 
      username: '', 
      nama: '', 
      departemen: '', 
      level: 'Users', 
      password: '' 
    };
    this.loadDepartemenMaster();
    this.loadAvailableKaryawan(); // 🔥 Ambil data dropdown
    this.isModalOpen = true;
  }

  openEditModal(u: User) {
    this.isEditing = true;
    this.selectedId = u.id_user || u.id || null;
    this.formData = { ...u, password: '' }; 
    this.loadDepartemenMaster();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanUser() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (this.isEditing && this.selectedId !== null) {
      this.http.put(`http://localhost:5000/api/users/${this.selectedId}`, this.formData, { headers }).subscribe({
        next: () => {
          alert('Data user berhasil diperbarui!');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => alert('Gagal memperbarui: ' + (err.error?.message || err.message))
      });
    } else {
      // 🔥 Saat tambah, pastikan formData.nik sudah terisi dari dropdown
      if (!this.formData.nik) {
        alert('Silakan pilih NIK Karyawan terlebih dahulu!');
        return;
      }
      this.http.post('http://localhost:5000/api/users', this.formData, { headers }).subscribe({
        next: () => {
          alert('User berhasil ditambahkan!');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => alert('Gagal menambah user: ' + (err.error?.message || err.message))
      });
    }
  }

  hapusUser(u: User) {
    const targetId = u.id_user || u.id;
    if (confirm(`Apakah Anda yakin ingin menghapus user ${u.username}?`)) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete(`http://localhost:5000/api/users/${targetId}`, { headers }).subscribe({
        next: () => {
          alert('User berhasil dihapus!');
          this.loadUsers();
        },
        error: (err) => alert('Gagal menghapus: ' + (err.error?.message || err.message))
      });
    }
  }

  getLevelClass(level: string): string {
    if (!level) return 'level-default';
    const l = level.toLowerCase();
    if (l === 'admin') return 'level-admin';
    if (l === 'teknisi') return 'level-teknisi';
    return 'level-users';
  }

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) { this.activeMenu = menu; }

  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToListTicket() { this.router.navigate(['/list']); }
  goToApprovalTicket() { this.activeMenu = 'approval-ticket'; this.router.navigate(['/approval']); }
  goToAssignmentTicket() { this.activeMenu = 'assignment-ticket'; this.router.navigate(['/assignment']); }
  goToKaryawan() { this.activeMenu = 'karyawan'; this.router.navigate(['/karyawan']); }
  goToUser() { this.activeMenu = 'user'; this.router.navigate(['/users']); }
  goToJabatan() { this.router.navigate(['/jabatan']); }
  goToDepartemen() { this.router.navigate(['/departemen']); }
  goToBagianDepartemen() { this.router.navigate(['/bagian-departemen']); }
  goToKategori() { this.router.navigate(['/kategori']); }
  goToSubKategori() { this.router.navigate(['/sub-kategori']); }
  goToTeknisi() { this.router.navigate(['/teknisi']); }
  goToInventory() { this.router.navigate(['/inventory']); }
  goToLaporanFeedback() { this.setActiveMenu('laporan-feedback'); this.router.navigate(['/laporan-feedback']); }
  goToStatistikTicket() { this.setActiveMenu('statistik-ticket'); this.router.navigate(['/statistik-ticket']); }
  goToProfile() { this.activeMenu = 'profile'; this.router.navigate(['/profile']); }
}