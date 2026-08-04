import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TicketService, TicketApiRow } from '../../services/ticket.service';
import { KategoriService, Kategori } from '../../services/kategori.service';
import { SubKategoriService, SubKategoriRow } from '../../services/sub-kategori.service';
import { AssetService } from '../../services/asset.service';
import { Asset } from '../../models/asset.model';
import { environment } from '../../../environments/environment';

export interface MyTicket {
  id: string;
  kategori: string;
  subKategori: string;
  asset: string;
  lampiran: string;
  lampiranPath: string;
  tanggal: string;
  status: string;
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

  // Data Tiket
  myTickets: MyTicket[] = [];
  isLoading = false;
  loadError = '';

  // Data Dropdown Form
  kategoriOptions: Kategori[] = [];
  subKategoriAll: SubKategoriRow[] = [];
  myAssets: Asset[] = [];

  get subKategoriOptions(): SubKategoriRow[] {
    if (!this.formData.idKategori) return [];
    return this.subKategoriAll.filter((s) => s.idKategori === this.formData.idKategori);
  }

  // State Modal Tambah Tiket
  isModalOpen = false;
  isSaving = false;
  formData = {
    idKategori: null as number | null,
    idSubKategori: null as number | null,
    asset: '',
    deskripsi: '',
    lampiranFile: null as File | null,
  };

  // Filter & Pagination
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  constructor(
    private router: Router,
    private ticketService: TicketService,
    private kategoriService: KategoriService,
    private subKategoriService: SubKategoriService,
    private assetService: AssetService
  ) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'User';
      } catch (e) {}
    }

    this.loadMyTickets();
    this.loadMyAssets();

    this.kategoriService.getAll().subscribe({
      next: (data: Kategori[]) => (this.kategoriOptions = data),
      error: (err: any) => console.error('Gagal mengambil daftar kategori', err),
    });

    this.subKategoriService.getAll().subscribe({
      next: (data: SubKategoriRow[]) => (this.subKategoriAll = data),
      error: (err: any) => console.error('Gagal mengambil daftar sub kategori', err),
    });
  }

  loadMyTickets() {
    this.isLoading = true;
    this.loadError = '';
    this.ticketService.getMineRaw().subscribe({
      next: (data: TicketApiRow[]) => {
        this.myTickets = data.map(this.mapToMyTicket);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Gagal mengambil tiket saya', err);
        this.loadError = err?.error?.message || 'Gagal memuat data tiket, coba lagi.';
        this.isLoading = false;
      },
    });
  }

  loadMyAssets() {
    this.assetService.getMyAssets().subscribe({
      next: (data: Asset[]) => (this.myAssets = data),
      error: (err: any) => console.error('Gagal mengambil daftar asset user', err),
    });
  }

  private mapToMyTicket(row: TicketApiRow): MyTicket {
    const tgl = new Date(row.tanggal);
    const tanggal = isNaN(tgl.getTime())
      ? row.tanggal
      : `${String(tgl.getDate()).padStart(2, '0')}-${String(tgl.getMonth() + 1).padStart(2, '0')}-${tgl.getFullYear()}`;

    return {
      id: row.id_ticket,
      kategori: row.nama_kategori || '-',
      subKategori: row.nama_sub_kategori || '-',
      asset: row.kode_asset || '-',
      lampiran: row.lampiran ? 'foto' : '-',
      lampiranPath: row.lampiran || '',
      tanggal,
      status: row.status,
    };
  }

  getLampiranUrl(lampiranPath: string): string {
    if (!lampiranPath) return '';
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    
    // Bersihkan path dan ambil nama file utamanya saja untuk menghindari nested folder error
    let cleanPath = lampiranPath.trim().replace(/\\/g, '/');
    const parts = cleanPath.split('/');
    const fileName = parts[parts.length - 1]; // Ambil nama file paling belakang (misal: 17857...png)

    return `${backendBase}/uploads/${fileName}`;
  }

  get filteredTickets(): MyTicket[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.myTickets;
    return this.myTickets.filter(
      (t) => t.id.toLowerCase().includes(term) || t.kategori.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTickets.length / this.pageSize));
  }
  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  get pagedTickets(): MyTicket[] {
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

  // Modal Handler
  openTambahModal() {
    this.formData = { idKategori: null, idSubKategori: null, asset: '', deskripsi: '', lampiranFile: null };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onKategoriChange() {
    this.formData.idSubKategori = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.lampiranFile = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  simpanTiket() {
    if (!this.formData.idKategori || !this.formData.idSubKategori || !this.formData.deskripsi) {
      alert('Kategori, Sub Kategori, dan Deskripsi wajib diisi!'); // Pesan alert disesuaikan
      return;
    }

    this.isSaving = true;
    this.ticketService
      .create(
        {
          id_kategori: String(this.formData.idKategori),
          id_sub_kategori: String(this.formData.idSubKategori),
          kode_asset: this.formData.asset || undefined,
          deskripsi: this.formData.deskripsi,
        },
        this.formData.lampiranFile || undefined
      )
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadMyTickets();
          alert('Tiket berhasil dikirim! Menunggu approval dari Admin.');
        },
        error: (err: any) => {
          this.isSaving = false;
          alert(err?.error?.message || 'Gagal mengirim tiket');
        },
      });
  }

  // Navigasi
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }

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

  getPageTitle(): string {
    return 'My Ticket';
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('solved')) return 'status-selesai';
    if (s.includes('process') || s.includes('proses')) return 'status-proses';
    if (s.includes('approve')) return 'status-approval';
    if (s.includes('menunggu')) return 'status-waiting';
    if (s.includes('reject')) return 'status-rejected';
    return 'status-default';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}