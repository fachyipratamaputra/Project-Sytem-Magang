import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TicketService, AssignedTicketApiRow } from '../../services/ticket.service';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { environment } from '../../../environments/environment';

export interface ProgressLogItem {
  id_log: number;
  progress: number;
  catatan: string;
  status_pengerjaan: string;
  created_at: string;
}

export interface ProsesTicket {
  idTicket: string;
  reportedBy: string;
  kategori: string;
  subKategori: string;
  asset: string;
  lampiran: string;
  lampiranUrl: string | null;
  deskripsi: string;
  progress: number;
  catatan: string;
  status: 'Menunggu Diproses' | 'Proses' | 'Selesai';
  isSaving?: boolean;
  isPaused?: boolean;
  isHistoryOpen?: boolean;
  history: ProgressLogItem[];
  deadline?: string | null;
}

@Component({
  selector: 'app-proses-tiket',
  templateUrl: './proses.page.html',
  styleUrls: ['./proses.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ProsesTiketPage implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  isSidebarOpen = false;
  activeMenu = 'proses-tiket';

  user = { nama: 'Teknisi', role: 'Teknisi' };

  tickets: ProsesTicket[] = [];
  isLoading = false;
  loadError = '';

  // ===== RETURN MODAL =====
  isReturnModalOpen = false;
  returnTicket: ProsesTicket | null = null;
  returnReason = '';

  // ===== CHAT =====
  isChatModalOpen = false;
  selectedTicketId = '';
  chatMessages: ChatMessage[] = [];
  newChatMessage = '';
  isChatLoading = false;
  selectedChatFile: File | null = null;
  selectedChatFilePreview: string = '';

  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  private tickInterval: any;
  private refreshInterval: any;

  constructor(
    private router: Router,
    private ticketService: TicketService,
    public chatService: ChatService
  ) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'Teknisi';
        this.user.role = parsed.role || 'Teknisi';
      } catch (e) {}
    }
    this.loadTickets();
    this.startTicking();
  }

  ngOnDestroy() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  private startTicking() {
    this.tickInterval = setInterval(() => {
      this.tickets = [...this.tickets];
    }, 1000);

    this.refreshInterval = setInterval(() => {
      this.loadTickets(true);
    }, 8000);
  }

  loadTickets(isSilent = false) {
    if (!isSilent) this.isLoading = true;
    this.loadError = '';
    this.ticketService.getAssignedMe().subscribe({
      next: (data: AssignedTicketApiRow[]) => {
        this.tickets = data
          .filter((row) => row.status_pengerjaan !== 'Menunggu Diproses')
          .map(this.mapToProsesTicket);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Gagal mengambil data tiket', err);
        if (!isSilent) {
          this.loadError = err?.error?.message || 'Gagal memuat data tiket, coba lagi.';
        }
        this.isLoading = false;
      },
    });
  }

  private mapToProsesTicket(row: AssignedTicketApiRow): ProsesTicket {
    const uploadsBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return {
      idTicket: row.id_ticket,
      reportedBy: row.nama_pelapor,
      kategori: row.nama_kategori,
      subKategori: row.nama_sub_kategori || '-',
      asset: row.aset || '-',
      lampiran: row.lampiran ? 'Foto' : '-',
      lampiranUrl: row.lampiran ? `${uploadsBase}${row.lampiran}` : null,
      deskripsi: row.deskripsi,
      progress: row.progress,
      catatan: row.catatan_penyelesaian || '',
      status: row.status_pengerjaan as 'Menunggu Diproses' | 'Proses' | 'Selesai',
      isPaused: (row as any).is_paused === 1,
      isHistoryOpen: false,
      history: [],
      deadline: row.deadline || row.tanggal_selesai || null
    };
  }

  toggleHistory(ticket: ProsesTicket) {
    ticket.isHistoryOpen = !ticket.isHistoryOpen;
    if (ticket.isHistoryOpen && ticket.history.length === 0) {
      this.ticketService.getProgressHistory(ticket.idTicket).subscribe({
        next: (res: any) => {
          ticket.history = res?.data || res || [];
        },
        error: (err: any) => console.error('Gagal load histori', err)
      });
    }
  }

  togglePause(ticket: ProsesTicket) {
    if (ticket.progress > 100) ticket.progress = 100;
    if (ticket.progress < 0) ticket.progress = 0;

    const payload = {
      progress: ticket.progress,
      catatan_penyelesaian: ticket.catatan || '',
      status_pengerjaan: ticket.status
    };

    this.ticketService.togglePause(ticket.idTicket, payload).subscribe({
      next: (res: any) => {
        ticket.isPaused = res?.data?.is_paused ?? !ticket.isPaused;

        if (ticket.isHistoryOpen) {
          this.ticketService.getProgressHistory(ticket.idTicket).subscribe({
            next: (histRes: any) => {
              ticket.history = histRes?.data || histRes || [];
            }
          });
        }
        alert(ticket.isPaused ? 'Timer berhasil dijeda & progress tersimpan ke history.' : 'Timer dilanjutkan.');
      },
      error: (err: any) => alert(err?.error?.message || 'Gagal toggle pause')
    });
  }

  // ========== 🔥 RETURN MODAL FUNCTIONS ==========
  openReturnModal(ticket: ProsesTicket) {
    this.returnTicket = ticket;
    this.returnReason = '';
    this.isReturnModalOpen = true;
  }

  closeReturnModal() {
    this.isReturnModalOpen = false;
    this.returnTicket = null;
  }

  submitReturn() {
    if (!this.returnTicket || !this.returnReason.trim()) return;

    this.ticketService.requestReturn(this.returnTicket.idTicket, this.returnReason).subscribe({
      next: () => {
        alert('Permintaan pengembalian berhasil dikirim ke Admin.');
        this.closeReturnModal();
        this.loadTickets();
      },
      error: (err) => {
        alert(err?.error?.message || 'Gagal mengirim permintaan.');
      }
    });
  }
  // ==========================================

  getCountdownText(ticket: ProsesTicket): string {
    if (ticket.isPaused) return '⏸️ DIJEDA';
    if (!ticket.deadline) return '-';

    const now = new Date().getTime();
    const target = new Date(ticket.deadline).getTime();
    const diff = target - now;

    if (diff <= 0) return '⚠️ TELAT';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  isDeadlineLate(ticket: ProsesTicket): boolean {
    if (ticket.isPaused) return false;
    if (!ticket.deadline) return false;
    return new Date().getTime() > new Date(ticket.deadline).getTime();
  }

  get filteredTickets(): ProsesTicket[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.tickets;
    return this.tickets.filter(t =>
      t.idTicket.toLowerCase().includes(term) ||
      t.reportedBy.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTickets.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedTickets(): ProsesTicket[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTickets.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ===== CHAT =====
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
      error: (err) => { console.error('Gagal load chat', err); this.isChatLoading = false; }
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
  openImagePreview(url: string | null) { if (url) window.open(url, '_blank'); }
  scrollToBottom() {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  // ===== UPDATE PROGRES =====
  updateStatus(ticket: ProsesTicket, status: 'Proses' | 'Selesai') {
    if (status === 'Selesai' && ticket.progress < 100) { ticket.progress = 100; }
    this.simpanKeBackend(ticket, status);
  }
  updateProgress(ticket: ProsesTicket) {
    if (ticket.progress > 100) ticket.progress = 100;
    if (ticket.progress < 0) ticket.progress = 0;
  }
  simpanKeBackend(ticket: ProsesTicket, status?: 'Proses' | 'Selesai') {
    const statusPengerjaan = status || ticket.status;
    ticket.isSaving = true;
    this.ticketService.updateProgress(ticket.idTicket, {
      progress: ticket.progress,
      catatan_penyelesaian: ticket.catatan,
      status_pengerjaan: statusPengerjaan,
    }).subscribe({
      next: () => {
        ticket.status = statusPengerjaan;
        ticket.isSaving = false;
        if (ticket.isHistoryOpen) {
          this.ticketService.getProgressHistory(ticket.idTicket).subscribe({
            next: (histRes: any) => { ticket.history = histRes?.data || histRes || []; }
          });
        }
        if (statusPengerjaan === 'Selesai') {
          this.tickets = this.tickets.filter((t) => t.idTicket !== ticket.idTicket);
        }
      },
      error: (err: any) => {
        ticket.isSaving = false;
        alert(err?.error?.message || 'Gagal menyimpan perubahan');
      }
    });
  }

  // ===== NAVIGASI =====
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }
  goToDashboardTeknisi() { this.setActiveMenu('dashboard-teknisi'); this.router.navigate(['/teknisi/dashboard']); }
  goToTicket() { this.setActiveMenu('ticket'); this.router.navigate(['/teknisi/ticket']); }
  goToProsesTiket() { this.setActiveMenu('proses-tiket'); this.router.navigate(['/teknisi/proses']); }
  goToRiwayatTiket() { this.setActiveMenu('riwayat-tiket'); this.router.navigate(['/teknisi/riwayat']); }
  goToPengaturan() { this.setActiveMenu('pengaturan'); }
  goToProfile() { this.setActiveMenu('profile'); }

  getPageTitle(): string { return 'Proses Tiket'; }
  getStatusClass(status: string): string {
    if (status === 'Proses') return 'status-proses';
    if (status === 'Selesai') return 'status-selesai';
    return 'status-default';
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}