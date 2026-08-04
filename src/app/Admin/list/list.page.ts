import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TicketService, Ticket as ServiceTicket } from '../../services/ticket.service';
import { InventoryService, InventoryItem } from '../../services/inventory.service';
import { KategoriService } from '../../services/kategori.service';
import { SubKategoriService } from '../../services/sub-kategori.service';
import { DepartemenService } from '../../services/departemen.services';

export interface ListTicket {
  id_ticket: string;
  reported: string;
  dept: string;
  tanggal: string;
  nama_kategori: string;
  nama_sub_kategori: string;
  aset: string;
  lampiran: string;
  teknisi: string;
  status: string;
  deskripsi?: string;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ListTicketPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'list-ticket';

  tickets: ListTicket[] = [];
  inventoryList: InventoryItem[] = [];
  isLoading = false;

  searchTerm = '';
  filterStatus = '';
  filterDepartemen = '';
  filterKategori = '';
  statusOptions: string[] = [];
  departemenOptions: string[] = [];
  kategoriOptions: string[] = [];

  currentPage = 1;
  pageSize = 10;

  isModalOpen = false;
  isEditing = false;
  selectedId: string | null = null;
  selectedFile: File | null = null;

  formData: any = {
    id_departemen: '',
    id_kategori: '',
    id_sub_kategori: '',
    kode_asset: '',
    deskripsi: '',
  };

  departemenOptionsForModal: any[] = [];
  kategoriOptionsForModal: any[] = [];
  subKategoriOptionsForModal: any[] = [];
  filteredSubKategoriOptions: any[] = [];
  filteredAssetOptions: any[] = [];

  constructor(
    private router: Router,
    private ticketService: TicketService,
    private inventoryService: InventoryService,
    private kategoriService: KategoriService,
    private subKategoriService: SubKategoriService,
    private departemenService: DepartemenService
  ) {}

  ngOnInit() {
    this.loadTickets();
    this.loadInventory();
    this.loadMasterDataModal();
  }

  // Method helper untuk mengarahkan URL lampiran agar akurat menembus backend
  getLampiranUrl(lampiranPath: string): string {
    if (!lampiranPath) return '';
    if (lampiranPath.startsWith('http')) {
      return lampiranPath;
    }
    const baseUrl = 'http://localhost:5000';
    
    // Bersihkan path jika mengandung duplikasi kata 'uploads' dari database
    let cleanPath = lampiranPath.replace(/^\/?uploads\/?/, '');
    cleanPath = cleanPath.replace(/^\/?lampiran\/?/, '');

    return `${baseUrl}/uploads/${cleanPath}`;
  }

  loadTickets() {
    this.isLoading = true;
    this.ticketService.getAll().subscribe({
      next: (data: ServiceTicket[]) => {
        this.tickets = data.map(item => ({
          id_ticket: item.idTicket,
          reported: item.reportedBy,
          dept: item.departemen,
          tanggal: item.tanggal,
          nama_kategori: item.kategori,
          nama_sub_kategori: item.subKategori,
          aset: item.aset,
          lampiran: item.lampiran,
          teknisi: item.teknisi,
          status: item.status,
          deskripsi: ''
        }));
        this.buildFilterOptions();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        if (err.status === 403 || err.status === 401) {
          alert('Akses ditolak. Pastikan Anda login sebagai Admin.');
        }
      }
    });
  }

  loadInventory() {
    this.inventoryService.getAll().subscribe({
      next: (data) => {
        this.inventoryList = data;
        this.filteredAssetOptions = data;
      },
      error: (err) => console.error('Gagal load inventory', err)
    });
  }

  loadMasterDataModal() {
    this.kategoriService.getAll().subscribe({
      next: (res: any) => {
        this.kategoriOptionsForModal = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => console.error('Gagal load kategori modal', err)
    });

    this.subKategoriService.getAll().subscribe({
      next: (res: any) => {
        this.subKategoriOptionsForModal = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => console.error('Gagal load sub kategori modal', err)
    });

    this.departemenService.getAll().subscribe({
      next: (res: any) => {
        this.departemenOptionsForModal = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => console.error('Gagal load departemen modal', err)
    });
  }

  onKategoriChange() {
    const selectedKatId = Number(this.formData.id_kategori);
    this.filteredSubKategoriOptions = this.subKategoriOptionsForModal.filter(
      (sub: any) => Number(sub.idKategori ?? sub.id_kategori) === selectedKatId
    );
    this.formData.id_sub_kategori = '';
  }

  onDepartemenChange() {
    const selectedDeptId = Number(this.formData.id_departemen);
    this.filteredAssetOptions = this.inventoryList.filter((ast: any) => {
      return !selectedDeptId || Number(ast.id_departemen) === selectedDeptId;
    });
  }

  private buildFilterOptions() {
    this.statusOptions = [...new Set(this.tickets.map((t) => t.status).filter(Boolean))];
    this.departemenOptions = [...new Set(this.tickets.map((t) => t.dept).filter(Boolean))];
    this.kategoriOptions = [...new Set(this.tickets.map((t) => t.nama_kategori).filter(Boolean))];
  }

  get filteredTickets(): ListTicket[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.tickets.filter((t) => {
      const matchSearch = !term || (t.id_ticket?.toLowerCase().includes(term) || t.reported?.toLowerCase().includes(term));
      const matchStatus = !this.filterStatus || t.status === this.filterStatus;
      const matchDept = !this.filterDepartemen || t.dept === this.filterDepartemen;
      const matchKategori = !this.filterKategori || t.nama_kategori === this.filterKategori;
      return matchSearch && matchStatus && matchDept && matchKategori;
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredTickets.length / this.pageSize)); }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedTickets(): ListTicket[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTickets.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  openTambahModal() {
    this.isEditing = false;
    this.selectedId = null;
    this.selectedFile = null;
    this.formData = {
      id_departemen: '',
      id_kategori: '',
      id_sub_kategori: '',
      kode_asset: '',
      deskripsi: '',
    };
    this.filteredSubKategoriOptions = [];
    this.filteredAssetOptions = this.inventoryList;
    this.isModalOpen = true;
  }

  openEditModal(ticket: ListTicket) {
    this.isEditing = true;
    this.selectedId = ticket.id_ticket;
    this.selectedFile = null;
    this.formData = { ...ticket };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  simpanTicket() {
    if (!this.formData.id_departemen || !this.formData.id_kategori || !this.formData.deskripsi) {
      alert('Departemen, Kategori, dan Deskripsi wajib diisi!');
      return;
    }

    this.ticketService.create(this.formData, this.selectedFile || undefined).subscribe({
      next: () => {
        alert('Tiket berhasil ditambahkan!');
        this.loadTickets();
        this.loadInventory();
        this.closeModal();
      },
      error: (err) => {
        console.error('Gagal menyimpan tiket:', err);
        alert('Gagal menyimpan tiket: ' + (err.error?.message || err.message));
      }
    });
  }

  hapusTicket(ticket: ListTicket) {
    if (confirm(`Apakah Anda yakin ingin menghapus tiket "${ticket.id_ticket}"?`)) {
      this.ticketService.getDetail(ticket.id_ticket).subscribe({
        next: () => { this.loadTickets(); },
        error: (err) => {
          console.error('Gagal menghapus tiket:', err);
          alert('Gagal menghapus tiket.');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-default';
    const s = status.toLowerCase();
    if (s.includes('proses') || s.includes('progress')) return 'status-proses';
    if (s.includes('approve') || s.includes('approval') || s.includes('menunggu')) return 'status-approval';
    if (s.includes('assign')) return 'status-assigned';
    if (s.includes('resolved') || s.includes('closed') || s.includes('selesai')) return 'status-closed';
    if (s.includes('reject') || s.includes('tolak')) return 'status-rejected';
    return 'status-default';
  }

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) { this.activeMenu = menu; }
  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToListTicket() { this.activeMenu = 'list-ticket'; this.router.navigate(['/list']); }
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
  goToLaporanFeedback() { this.activeMenu = 'laporan-feedback'; }
  goToStatistikTicket() { this.router.navigate(['/statistik-ticket']); }
  goToProfile() { this.activeMenu = 'profile'; }

  onViewDetail(ticket: ListTicket) { console.log('View detail', ticket.id_ticket); }
  onEditTicket(ticket: ListTicket) { this.openEditModal(ticket); }
  onNewTicket() { this.openTambahModal(); }
}