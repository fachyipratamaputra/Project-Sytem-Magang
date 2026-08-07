import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TicketService, TicketApiRow } from '../../services/ticket.service';
import { KategoriService, Kategori } from '../../services/kategori.service';
import { SubKategoriService, SubKategoriRow } from '../../services/sub-kategori.service';
import { AssetService } from '../../services/asset.service';
import { Asset } from '../../models/asset.model';
import { ChatService, ChatMessage } from '../../services/chat.service';
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
  prioritas?: 'Low' | 'Normal' | 'Urgent';
  deadline?: string | null;
  isPaused?: number;
  waktuSelesai?: string | null;
}

@Component({
  selector: 'app-my-ticket',
  templateUrl: './myticket.page.html',
  styleUrls: ['./myticket.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class MyTicketPage implements OnInit {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  isSidebarOpen = false;
  activeMenu = 'my-ticket';
  private countdownInterval: any;
  // 🔥 BARU: interval terpisah buat re-fetch data ticket dari backend secara berkala,
  // supaya perubahan is_paused/status yang dilakukan Teknisi ikut kedeteksi
  // tanpa User harus pindah halaman dulu.
  private refreshInterval: any;

  user = {
    nama: 'User',
    role: 'Users',
  };

  myTickets: MyTicket[] = [];
  isLoading = false;
  loadError = '';

  kategoriOptions: Kategori[] = [];
  subKategoriAll: SubKategoriRow[] = [];
  myAssets: Asset[] = [];

  get subKategoriOptions(): SubKategoriRow[] {
    if (!this.formData.idKategori) return [];
    return this.subKategoriAll.filter((s) => s.idKategori === this.formData.idKategori);
  }

  isModalOpen = false;
  isSaving = false;
  formData = {
    idKategori: null as number | null,
    idSubKategori: null as number | null,
    asset: '',
    deskripsi: '',
    prioritas: 'Normal' as 'Low' | 'Normal' | 'Urgent',
    lampiranFile: null as File | null,
  };

  // State Chat
  isChatModalOpen = false;
  selectedTicketId = '';
  chatMessages: ChatMessage[] = [];
  newChatMessage = '';
  isChatLoading = false;
  selectedChatFile: File | null = null;
  selectedChatFilePreview: string = '';

  // State Modal Riwayat & Catatan Teknisi
  isHistoryModalOpen = false;
  selectedTicketHistory: any[] = [];
  isHistoryLoading = false;

  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  constructor(
    private router: Router,
    private ticketService: TicketService,
    private kategoriService: KategoriService,
    private subKategoriService: SubKategoriService,
    private assetService: AssetService,
    public chatService: ChatService
  ) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'User';
        const rawRole = parsed.role || 'users';
        this.user.role = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
      } catch (e) {}
    }

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

  ionViewWillEnter() {
    this.loadMyTickets();
  }

  ionViewDidEnter() {
    this.startTimer();
  }

  ionViewWillLeave() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  startTimer() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.refreshInterval) clearInterval(this.refreshInterval);

    // Tampilan countdown "hidup" tiap detik (cuma re-render, bukan fetch ulang)
    this.countdownInterval = setInterval(() => {
      this.myTickets = [...this.myTickets];
    }, 1000);

    // 🔥 BARU: ambil ulang data dari backend tiap 8 detik, biar status is_paused
    // (atau progress/status lain) yang diubah Teknisi kelihatan di sini tanpa
    // User harus keluar-masuk halaman ini dulu.
    this.refreshInterval = setInterval(() => {
      this.loadMyTickets(true);
    }, 8000);
  }

  loadMyTickets(isSilent = false) {
    if (!isSilent) this.isLoading = true;
    this.loadError = '';
    this.ticketService.getMineRaw().subscribe({
      next: (data: TicketApiRow[]) => {
        this.myTickets = (data || []).map(this.mapToMyTicket);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Gagal mengambil tiket saya', err);
        if (!isSilent) {
          this.loadError = err?.error?.message || 'Gagal memuat data tiket, coba lagi.';
        }
        this.isLoading = false;
      },
    });
  }

  loadMyAssets() {
    this.assetService.getMyAssets().subscribe({
      next: (data: Asset[]) => (this.myAssets = data || []),
      error: (err: any) => console.error('Gagal mengambil daftar asset user', err),
    });
  }

  private mapToMyTicket(row: TicketApiRow): MyTicket {
    const tgl = new Date(row.tanggal);
    const tanggal = isNaN(tgl.getTime())
      ? row.tanggal
      : `${String(tgl.getDate()).padStart(2, '0')}-${String(tgl.getMonth() + 1).padStart(2, '0')}-${tgl.getFullYear()}`;

    let waktuSelesai = null;
    if (row.tanggal_selesai) {
      const endDate = new Date(row.tanggal_selesai);
      if (!isNaN(endDate.getTime())) {
        waktuSelesai =
          `${String(endDate.getDate()).padStart(2, '0')}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${endDate.getFullYear()} ` +
          `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
      }
    }

    return {
      id: row.id_ticket,
      kategori: row.nama_kategori || '-',
      subKategori: row.nama_sub_kategori || '-',
      asset: row.aset || '-',
      lampiran: row.lampiran ? 'foto' : '-',
      lampiranPath: row.lampiran || '',
      tanggal,
      status: row.status || '-',
      prioritas: row.prioritas || 'Normal',
      deadline: row.deadline || null,
      isPaused: row.is_paused ?? 0,
      waktuSelesai
    };
  }

  getLampiranUrl(lampiranPath: string): string {
    if (!lampiranPath) return '';
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    let cleanPath = lampiranPath.trim().replace(/\\/g, '/');
    const parts = cleanPath.split('/');
    const fileName = parts[parts.length - 1];
    return `${backendBase}/uploads/${fileName}`;
  }

  getStatusText(status: string): string {
    if (!status) return '-';
    if (status.toLowerCase() === 'solved') return 'Selesai';
    if (status.toLowerCase().includes('approve')) return 'Approve Internal';
    if (status.toLowerCase().includes('menunggu')) return 'Menunggu Approval';
    if (status.toLowerCase() === 'reject') return 'Ditolak';
    if (status.toLowerCase().includes('proses')) return 'On Process';
    return status;
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s === 'solved' || s === 'selesai') return 'status-success';
    if (s.includes('approve')) return 'status-primary';
    if (s.includes('menunggu')) return 'status-warning';
    if (s === 'reject' || s === 'ditolak') return 'status-danger';
    if (s.includes('proses')) return 'status-info';
    return '';
  }

  getCountdownText(ticket: MyTicket): string {
    if (!ticket.deadline) return '-';

    if (ticket.isPaused === 1) {
      return '⏸️ DITUNDA / DIJEDA';
    }

    const now = new Date().getTime();
    const target = new Date(ticket.deadline).getTime();
    const diff = target - now;

    if (diff <= 0) return '⚠️ TELAT';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  isDeadlineLate(ticket: MyTicket): boolean {
    if (!ticket.deadline || ticket.isPaused === 1) return false;
    return new Date().getTime() > new Date(ticket.deadline).getTime();
  }

  openHistoryModal(idTicket: string) {
    this.selectedTicketId = idTicket;
    this.isHistoryModalOpen = true;
    this.isHistoryLoading = true;
    this.selectedTicketHistory = [];

    this.ticketService.getProgressHistory(idTicket).subscribe({
      next: (data) => {
        this.selectedTicketHistory = data || [];
        this.isHistoryLoading = false;
      },
      error: (err) => {
        console.error('Gagal memuat riwayat progres', err);
        this.isHistoryLoading = false;
      }
    });
  }

  closeHistoryModal() {
    this.isHistoryModalOpen = false;
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

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  openChatModal(idTicket: string) {
    this.selectedTicketId = idTicket;
    this.chatMessages = [];
    this.newChatMessage = '';
    this.selectedChatFile = null;
    this.selectedChatFilePreview = '';
    this.isChatModalOpen = true;
    this.loadChatMessages(idTicket);
  }

  closeChatModal() { this.isChatModalOpen = false; }

  loadChatMessages(idTicket: string) {
    this.isChatLoading = true;
    this.chatService.getChats(idTicket).subscribe({
      next: (res) => {
        this.chatMessages = res?.data || res || [];
        this.isChatLoading = false;
        setTimeout(() => this.scrollToBottom(), 150);
      },
      error: (err) => {
        console.error('Gagal load chat', err);
        this.isChatLoading = false;
      }
    });
  }

  onChatFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedChatFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedChatFilePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  sendChat() {
    const messageText = this.newChatMessage.trim();
    if (!messageText && !this.selectedChatFile) return;
    this.chatService.sendMessage(this.selectedTicketId, messageText, this.selectedChatFile).subscribe({
      next: (res) => {
        const newMsg = res?.data || res;
        this.chatMessages.push(newMsg);
        this.newChatMessage = '';
        this.selectedChatFile = null;
        this.selectedChatFilePreview = '';
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Gagal kirim chat', err);
        alert('Gagal mengirim pesan: ' + (err.error?.message || err.message));
      }
    });
  }

  openImagePreview(url: string | null) {
    if (url) window.open(url, '_blank');
  }
  scrollToBottom() {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  openTambahModal() {
    this.formData = {
      idKategori: null,
      idSubKategori: null,
      asset: '',
      deskripsi: '',
      prioritas: '' as any,
      lampiranFile: null
    };
    this.isModalOpen = true;
  }

  closeModal() { this.isModalOpen = false; }

  onKategoriChange() { this.formData.idSubKategori = null; }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.lampiranFile = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  simpanTiket() {
    if (!this.formData.idKategori || !this.formData.idSubKategori || !this.formData.prioritas || !this.formData.deskripsi) {
      alert('Kategori, Sub Kategori, Prioritas, dan Deskripsi wajib diisi!');
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
          prioritas: this.formData.prioritas
        },
        this.formData.lampiranFile || undefined
      )
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadMyTickets();
          this.startTimer();
          alert('Tiket berhasil dikirim! Menunggu approval dari Admin.');
        },
        error: (err: any) => {
          this.isSaving = false;
          alert(err?.error?.message || 'Gagal mengirim tiket');
        },
      });
  }

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }

  goToDashboardUser() { this.setActiveMenu('dashboard-user'); this.router.navigate(['/users/dashboard']); }
  goToMyTicket() { this.setActiveMenu('my-ticket'); this.router.navigate(['/users/my-ticket']); }
  goToInputAset() { this.setActiveMenu('input-aset'); this.router.navigate(['/users/asset']); }
  goToLaporanFeedback() { this.setActiveMenu('laporan-feedback'); this.router.navigate(['/users/feedback']); }
  goToPengaturan() { this.setActiveMenu('pengaturan'); this.router.navigate(['/users/settings']); }
  logout() { localStorage.clear(); this.router.navigate(['/auth/login']); }
  goToProfile() { this.router.navigate(['/users/profile']); }
  getPageTitle(): string { return 'My Ticket'; }
}