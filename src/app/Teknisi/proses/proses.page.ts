import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { TicketService, AssignedTicketApiRow, ChecklistItemApiRow, ChecklistApprovalRow } from '../../services/ticket.service';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { environment } from '../../../environments/environment';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).vfs || (pdfFonts as any).pdfMake?.vfs;

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
  departemen: string;
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
  checklist: ChecklistItemApiRow[];
  deadline?: string | null;
  userKonfirmasi?: boolean;
  tanggalKonfirmasiUser?: string | null;
  adminApprove?: boolean;
  adminApproveBy?: string | null;
  adminApproveAt?: string | null;
  tanggalDibuatSchedule?: string | null;
}

export interface ChecklistGroup {
  kategori: string;
  items: ChecklistItemApiRow[];
}

export type ChecklistSection =
  | { type: 'header'; label: string }
  | { type: 'group'; kategori: string; items: ChecklistItemApiRow[]; number: number };

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

  isReturnModalOpen = false;
  returnTicket: ProsesTicket | null = null;
  returnReason = '';

  isChatModalOpen = false;
  selectedTicketId = '';
  chatMessages: ChatMessage[] = [];
  newChatMessage = '';
  isChatLoading = false;
  selectedChatFile: File | null = null;
  selectedChatFilePreview: string = '';

  isChecklistModalOpen = false;
  selectedChecklistTicket: ProsesTicket | null = null;
  groupedChecklist: ChecklistGroup[] = [];
  checklistSections: ChecklistSection[] = [];
  today = new Date().toLocaleDateString('id-ID');

  kondisiHurufOptions: ('B' | 'C' | 'D')[] = ['B', 'C', 'D'];

  selectedChecklistApproval: ChecklistApprovalRow | null = null;
  isLoadingApproval = false;
  isSubmittingApproval = false;

  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  private readonly specialSectionLabels: { [kategoriUnit: string]: string } = {
    'Printer/Scanner': 'Kode Assets (Printer / Scanner *)',
    'Network Equipment': 'Kode Assets (Network *)',
  };

  private logoBase64Cache: string | null = null;

  private tickInterval: any;
  private refreshInterval: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute, // 🔥 BARU
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
    this.stopTicking();
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  private startTicking() {
    if (this.tickInterval) return;

    this.tickInterval = setInterval(() => {
      this.tickets = [...this.tickets];
    }, 1000);

    if (!this.refreshInterval) {
      this.refreshInterval = setInterval(() => {
        this.loadTickets(true);
      }, 100000);
    }
  }

  private stopTicking() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  loadTickets(isSilent = false) {
    if (!isSilent) this.isLoading = true;
    this.loadError = '';
    this.ticketService.getAssignedMe().subscribe({
      next: (data: AssignedTicketApiRow[]) => {
        const freshTickets = data
          .filter((row) => row.status_pengerjaan !== 'Menunggu Diproses')
          .map(this.mapToProsesTicket);

        if (isSilent) {
          this.tickets = freshTickets.map((fresh) => {
            const existing = this.tickets.find((t) => t.idTicket === fresh.idTicket);
            if (existing) {
              return {
                ...fresh,
                progress: existing.progress,
                catatan: existing.catatan,
                isHistoryOpen: existing.isHistoryOpen,
                history: existing.history,
                checklist: existing.checklist,
              };
            }
            return fresh;
          });
        } else {
          this.tickets = freshTickets;
          this.openTicketFromQueryParam(); // 🔥 BARU — hanya jalan saat load awal (non-silent)
        }

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

  // 🔥 BARU — auto-buka modal Check Sheet kalau datang dari klaim asset
  // (schedule.page.ts Teknisi mengirim ?openTicket=<id_ticket>)
  private openTicketFromQueryParam() {
    const targetTicketId = this.route.snapshot.queryParamMap.get('openTicket');
    if (!targetTicketId) return;

    // hilangkan query param dari URL biar refresh/reload gak buka modal lagi
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });

    const target = this.tickets.find((t) => t.idTicket === targetTicketId);
    if (target) {
      setTimeout(() => this.openChecklistModal(target), 200);
    }
  }

  private mapToProsesTicket(row: AssignedTicketApiRow): ProsesTicket {
    const uploadsBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return {
      idTicket: row.id_ticket,
      reportedBy: row.nama_pelapor,
      departemen: row.departemen || '-',
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
      checklist: [],
      deadline: row.deadline || row.tanggal_selesai || null,
      userKonfirmasi: (row as any).user_konfirmasi === 1,
      tanggalKonfirmasiUser: (row as any).tanggal_konfirmasi_user || null,
      adminApprove: (row as any).admin_approve === 1,
      adminApproveBy: (row as any).admin_approve_by || null,
      adminApproveAt: (row as any).admin_approve_at || null,
      tanggalDibuatSchedule: (row as any).tanggal_dibuat_schedule || null,
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

  openChecklistModal(ticket: ProsesTicket) {
    this.selectedChecklistTicket = ticket;
    this.isChecklistModalOpen = true;
    this.selectedChecklistApproval = null;

    this.stopTicking();

    this.groupedChecklist = this.getGroupedChecklist(ticket);
    this.checklistSections = this.buildChecklistSections(this.groupedChecklist);
    this.loadChecklistApproval(ticket.idTicket);

    if (ticket.checklist.length === 0) {
      this.ticketService.getChecklist(ticket.idTicket).subscribe({
        next: (data: ChecklistItemApiRow[]) => {
          ticket.checklist = data || [];
          this.groupedChecklist = this.getGroupedChecklist(ticket);
          this.checklistSections = this.buildChecklistSections(this.groupedChecklist);
        },
        error: (err: any) => console.error('Gagal load checklist', err)
      });
    }
  }

  closeChecklistModal() {
    this.isChecklistModalOpen = false;
    this.selectedChecklistTicket = null;
    this.groupedChecklist = [];
    this.checklistSections = [];
    this.selectedChecklistApproval = null;

    this.startTicking();
  }

  getGroupedChecklist(ticket: ProsesTicket | null): ChecklistGroup[] {
    if (!ticket) return [];
    const map = new Map<string, ChecklistItemApiRow[]>();
    for (const item of ticket.checklist) {
      if (!map.has(item.kategori_unit)) map.set(item.kategori_unit, []);
      map.get(item.kategori_unit)!.push(item);
    }
    return Array.from(map.entries()).map(([kategori, items]) => ({ kategori, items }));
  }

  buildChecklistSections(groups: ChecklistGroup[]): ChecklistSection[] {
    const sections: ChecklistSection[] = [];
    let normalCounter = 0;

    for (const group of groups) {
      const sectionLabel = this.specialSectionLabels[group.kategori];
      if (sectionLabel) {
        sections.push({ type: 'header', label: sectionLabel });
        sections.push({ type: 'group', kategori: group.kategori, items: group.items, number: 1 });
      } else {
        normalCounter++;
        sections.push({ type: 'group', kategori: group.kategori, items: group.items, number: normalCounter });
      }
    }

    return sections;
  }

  trackBySection(index: number, section: ChecklistSection): string {
    return section.type === 'header' ? `header-${section.label}` : `group-${section.kategori}`;
  }

  setKondisiOk(item: ChecklistItemApiRow, checked: boolean) {
    item.kondisi = checked ? 'OK' : (null as any);
    item.kondisi_huruf = null;
    item._showHurufPicker = false;
    this.updateChecklistItem(item);
  }

  setKondisiNc(item: ChecklistItemApiRow, checked: boolean) {
    if (checked) {
      item._showHurufPicker = true;
    } else {
      item.kondisi = null as any;
      item.kondisi_huruf = null;
      item._showHurufPicker = false;
      this.updateChecklistItem(item);
    }
  }

  onClickNcBox(item: ChecklistItemApiRow) {
    this.setKondisiNc(item, item.kondisi !== 'NC');
  }

  pilihHurufNc(item: ChecklistItemApiRow, huruf: 'B' | 'C' | 'D') {
    item.kondisi = 'NC';
    item.kondisi_huruf = huruf;
    item._showHurufPicker = false;
    this.updateChecklistItem(item);
  }

  batalPilihHurufNc(item: ChecklistItemApiRow) {
    item._showHurufPicker = false;
  }

  updateChecklistItem(item: ChecklistItemApiRow) {
    this.ticketService.updateChecklistItem(item.id_result, {
      kondisi: item.kondisi,
      kondisi_huruf: item.kondisi_huruf,
      catatan: item.catatan || ''
    }).subscribe({
      error: (err: any) => alert(err?.error?.message || 'Gagal menyimpan checklist')
    });
  }

  trackByGroup(index: number, group: ChecklistGroup): string {
    return group.kategori;
  }

  trackByChecklistItem(index: number, item: ChecklistItemApiRow): number {
    return item.id_result;
  }

  loadChecklistApproval(idTicket: string) {
    this.isLoadingApproval = true;
    this.ticketService.getChecklistApproval(idTicket).subscribe({
      next: (res: ChecklistApprovalRow) => {
        this.selectedChecklistApproval = res;
        this.isLoadingApproval = false;
      },
      error: (err: any) => {
        console.error('Gagal load status approval', err);
        this.isLoadingApproval = false;
      }
    });
  }

  ajukanApprovalChecklist(t: ProsesTicket) {
    if (t.status !== 'Selesai') {
      alert('Tiket harus berstatus Selesai sebelum diajukan approval.');
      return;
    }
    const belumIsi = t.checklist.filter((i) => !i.kondisi).length;
    if (belumIsi > 0) {
      alert(`Masih ada ${belumIsi} item checklist yang belum diisi OK/NC.`);
      return;
    }

    this.isSubmittingApproval = true;
    this.ticketService.ajukanApprovalChecklist(t.idTicket).subscribe({
      next: () => {
        this.isSubmittingApproval = false;
        alert('Check Sheet berhasil diajukan. Tanda tangan Teknisi & IT Service otomatis terisi, menunggu approval User.');
        this.loadChecklistApproval(t.idTicket);
        this.removeTicketFromList(t.idTicket);
        this.closeChecklistModal();
      },
      error: (err: any) => {
        this.isSubmittingApproval = false;
        alert(err?.error?.message || 'Gagal mengajukan approval');
      }
    });
  }

  getApprovalStageLabel(): string {
    const a = this.selectedChecklistApproval;
    if (!a || !a.dibuat_oleh_nik) return 'Belum diajukan';
    if (a.status_diketahui === 'Reject') return 'Ditolak User';
    if (a.status_diketahui !== 'Approve') return 'Menunggu approval User';
    return 'Disetujui — siap export PDF';
  }

  get canAjukanApproval(): boolean {
    const t = this.selectedChecklistTicket;
    if (!t) return false;
    if (t.status !== 'Selesai') return false;
    if (this.selectedChecklistApproval?.dibuat_oleh_nik && this.selectedChecklistApproval.status_disetujui !== 'Reject') {
      return false;
    }
    return true;
  }

  getSignatureUrl(path: string | null | undefined): string {
    if (!path) return '';
    const uploadsBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${uploadsBase}${path}`;
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
      error: (err: any) => {
        alert(err?.error?.message || 'Gagal mengirim permintaan.');
      }
    });
  }

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

  trackByTicket(index: number, t: ProsesTicket): string {
    return t.idTicket;
  }

  trackByHistory(index: number, h: ProgressLogItem): number {
    return h.id_log;
  }

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
      next: (res: any) => {
        this.chatMessages = res?.data || res || [];
        this.isChatLoading = false;
        setTimeout(() => this.scrollToBottom(), 150);
      },
      error: (err: any) => { console.error('Gagal load chat', err); this.isChatLoading = false; }
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
      next: (res: any) => {
        const newMsg = res?.data || res;
        this.chatMessages.push(newMsg);
        this.newChatMessage = '';
        this.selectedChatFile = null;
        this.selectedChatFilePreview = '';
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err: any) => {
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

  updateStatus(ticket: ProsesTicket, status: 'Proses' | 'Selesai') {
    if (status === 'Selesai' && ticket.progress < 100) { ticket.progress = 100; }
    this.simpanKeBackend(ticket, status);
  }

  updateProgress(ticket: ProsesTicket) {
    if (ticket.progress > 100) ticket.progress = 100;
    if (ticket.progress < 0) ticket.progress = 0;
  }

  simpanKeBackend(ticket: ProsesTicket, status?: 'Proses' | 'Selesai') {
    let statusPengerjaan = status || ticket.status;
    if (ticket.progress > 0 && statusPengerjaan === 'Menunggu Diproses') {
      statusPengerjaan = 'Proses';
    }

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
          this.autoAjukanApproval(ticket);
        }
      },
      error: (err: any) => {
        ticket.isSaving = false;
        alert(err?.error?.message || 'Gagal menyimpan perubahan');
      }
    });
  }

  private autoAjukanApproval(ticket: ProsesTicket) {
    this.ticketService.ajukanApprovalChecklist(ticket.idTicket).subscribe({
      next: () => {
        this.removeTicketFromList(ticket.idTicket);
      },
      error: (err: any) => {
        alert(
          (err?.error?.message || 'Gagal mengajukan Check Sheet secara otomatis') +
          '\n\nSilakan buka Check Sheet, lengkapi checklist OK/NC, lalu klik "Ajukan ke User".'
        );
      }
    });
  }

  private removeTicketFromList(idTicket: string) {
    this.tickets = this.tickets.filter((t) => t.idTicket !== idTicket);
  }

  private async getLogoBase64(): Promise<string> {
    if (this.logoBase64Cache) return this.logoBase64Cache;
    const response = await fetch('assets/logo bakrie.png');
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    this.logoBase64Cache = base64;
    return base64;
  }

  private getHeaderTanggalText(t: ProsesTicket): string {
    if (t.tanggalDibuatSchedule) {
      return new Date(t.tanggalDibuatSchedule).toLocaleDateString('id-ID');
    }
    return '15-07-2014';
  }

  async exportChecklistPdf(t: ProsesTicket) {
    if (!t.checklist || t.checklist.length === 0) {
      alert('Checklist belum dimuat. Buka form checklist dulu sebelum export PDF.');
      return;
    }

    let approval: ChecklistApprovalRow | null = null;
    try {
      approval = await firstValueFrom(this.ticketService.getChecklistApproval(t.idTicket));
    } catch (e) {
      alert('Gagal mengecek status approval Check Sheet.');
      return;
    }

    if (!approval || approval.status_diketahui !== 'Approve') {
      alert('PDF hanya bisa di-export setelah Check Sheet disetujui User.');
      return;
    }

    let logoBase64 = '';
    try {
      logoBase64 = await this.getLogoBase64();
    } catch (e) {
      console.warn('Logo gagal dimuat, PDF tetap dibuat tanpa logo.', e);
    }

    const loadImageAsBase64 = async (relativePath: string | null): Promise<string> => {
      if (!relativePath) return '';
      try {
        const uploadsBase = environment.apiUrl.replace(/\/api\/?$/, '');
        const response = await fetch(`${uploadsBase}${relativePath}`);
        const blob = await response.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Tanda tangan gagal dimuat untuk PDF:', e);
        return '';
      }
    };

    const [ttdDibuat, ttdDiketahui, ttdDisetujui] = await Promise.all([
      loadImageAsBase64(approval.ttd_dibuat_oleh),
      loadImageAsBase64(approval.ttd_diketahui_oleh),
      loadImageAsBase64(approval.ttd_disetujui_oleh),
    ]);

    const grouped: { [key: string]: ChecklistItemApiRow[] } = {};
    const order: string[] = [];
    for (const item of t.checklist) {
      if (!grouped[item.kategori_unit]) {
        grouped[item.kategori_unit] = [];
        order.push(item.kategori_unit);
      }
      grouped[item.kategori_unit].push(item);
    }

    const bodyRows: any[] = [];
    let normalCounter = 0;
    order.forEach((kategori) => {
      const items = grouped[kategori];
      const sectionLabel = this.specialSectionLabels[kategori];
      let displayNumber: number;

      if (sectionLabel) {
        bodyRows.push([
          { text: sectionLabel, colSpan: 8, bold: true, fontSize: 8, fillColor: '#eeeeee', margin: [2, 2, 2, 2] },
          {}, {}, {}, {}, {}, {}, {},
        ]);
        displayNumber = 1;
      } else {
        normalCounter++;
        displayNumber = normalCounter;
      }

      items.forEach((item, itemIdx) => {
        bodyRows.push([
          itemIdx === 0 ? { text: String(displayNumber), rowSpan: items.length, alignment: 'center', fontSize: 8 } : {},
          itemIdx === 0 ? { text: kategori, rowSpan: items.length, fontSize: 8 } : {},
          { text: item.uraian_pekerjaan, fontSize: 8 },
          { text: item.alat_yang_digunakan || '-', fontSize: 7 },
          { text: item.penerimaan_default || '-', fontSize: 8 },
          { text: item.kondisi === 'OK' ? '✓' : '', alignment: 'center', fontSize: 9 },
          { text: item.kondisi === 'NC' ? (item.kondisi_huruf || '✓') : '', alignment: 'center', fontSize: 9, bold: true },
          { text: item.catatan || '', fontSize: 7 },
        ]);
      });
    });

    const headerLogo: any = logoBase64
      ? { image: logoBase64, width: 55 }
      : { text: '', width: 55 };

    const fmtTgl = (d: string | null) => d ? new Date(d).toLocaleDateString('id-ID') : '-';

    const buildSignatureCell = (ttdBase64: string, nama: string | null, tanggal: string | null) => {
      const stack: any[] = [];
      if (ttdBase64) {
        stack.push({ image: ttdBase64, width: 90, height: 40, alignment: 'center', margin: [0, 2, 0, 2] });
      }
      stack.push({ text: `${nama || '-'}\n(${fmtTgl(tanggal)})`, alignment: 'center', fontSize: 9 });
      return { stack, alignment: 'center', margin: [0, ttdBase64 ? 4 : 12, 0, 4] };
    };

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [30, 20, 30, 40],
      content: [
        {
          table: {
            widths: [55, '*', 130],
            body: [
              [
                headerLogo,
                {
                  stack: [
                    { text: 'CHECK SHEET', bold: true, fontSize: 14, alignment: 'center' },
                    { text: 'PERSONAL COMPUTER, SOFTWARE', fontSize: 9, alignment: 'center' },
                    { text: 'PRINTER, SCANNER & NETWORK', fontSize: 9, alignment: 'center' },
                  ],
                },
                {
                  stack: [
                    { text: 'No.Form : FRM/IT/CS/001', fontSize: 8 },
                    { text: 'No.Rev : 00', fontSize: 8 },
                    { text: `Tanggal : ${this.getHeaderTanggalText(t)}`, fontSize: 8 },
                  ],
                },
              ],
            ],
          },
          layout: { hLineWidth: () => 0.75, vLineWidth: () => 0.75 },
          margin: [0, 0, 0, 0],
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: `Tanggal Pelaksanaan : ${new Date().toLocaleDateString('id-ID')}`, fontSize: 9 },
                { text: `Department : ${t.departemen || '-'}`, fontSize: 9 },
              ],
              [
                { text: `IT Propertis : ${t.asset || '-'}`, fontSize: 9 },
                { text: `Sub Department : ${t.subKategori || '-'}`, fontSize: 9 },
              ],
            ],
          },
          layout: { hLineWidth: () => 0.75, vLineWidth: () => 0.75 },
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: [20, '18%', '27%', '13%', '12%', 22, 22, '15%'],
            body: [
              [
                { text: 'NO', bold: true, fontSize: 8, alignment: 'center' },
                { text: 'UNIT', bold: true, fontSize: 8 },
                { text: 'URAIAN PEKERJAAN', bold: true, fontSize: 8 },
                { text: 'ALAT', bold: true, fontSize: 8 },
                { text: 'PENERIMAAN', bold: true, fontSize: 8 },
                { text: 'OK', bold: true, fontSize: 8, alignment: 'center' },
                { text: 'NC', bold: true, fontSize: 8, alignment: 'center' },
                { text: 'CATATAN', bold: true, fontSize: 8 },
              ],
              ...bodyRows,
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
          },
        },
        { text: ' ', margin: [0, 8, 0, 0] },
        {
          table: {
            widths: ['*', 150],
            body: [
              [
                {
                  fontSize: 7,
                  stack: [
                    { text: 'Catatan:', bold: true },
                    { text: 'B : Masih dapat beroperasi, dan masih bisa dipertahankan, sampai waktu disiapkan dan persiapan sparepart' },
                    { text: 'C : Segera diperbaiki atau harus segera diperbaiki dan waktu perbaikan ditentukan ITS' },
                    { text: 'D : Harus berhenti / tidak mampu berkerja' },
                  ],
                },
                {
                  fontSize: 7,
                  stack: [
                    { text: 'Kondisi NC :', bold: true },
                    { text: 'B : Masih Baik' },
                    { text: 'C : Segera Diperbaiki' },
                    { text: 'D : Harus diganti' },
                  ],
                },
              ],
            ],
          },
          layout: { hLineWidth: () => 0.75, vLineWidth: () => 0.75 },
          margin: [0, 4, 0, 8],
        },
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'STATUS', bold: true, alignment: 'center', fontSize: 9 },
                { text: 'DIBUAT OLEH', bold: true, alignment: 'center', fontSize: 9 },
                { text: 'DIKETAHUI', bold: true, alignment: 'center', fontSize: 9 },
                { text: 'DISETUJUI', bold: true, alignment: 'center', fontSize: 9 },
              ],
              [
                { text: t.status.toUpperCase(), alignment: 'center', margin: [0, 20, 0, 20], fontSize: 9 },
                buildSignatureCell(ttdDibuat, approval.nama_dibuat_oleh || this.user.nama, approval.tanggal_dibuat),
                buildSignatureCell(ttdDiketahui, approval.nama_diketahui_oleh, approval.tanggal_diketahui),
                buildSignatureCell(ttdDisetujui, approval.nama_disetujui_oleh, approval.tanggal_disetujui),
              ],
              [
                { text: 'Diisi Technician', fontSize: 7, alignment: 'center' },
                { text: 'Technician', fontSize: 7, alignment: 'center' },
                { text: 'User', fontSize: 7, alignment: 'center' },
                { text: 'IT Service', fontSize: 7, alignment: 'center' },
              ],
            ],
          },
        },
      ],
    };

    pdfMake.createPdf(docDefinition).download(`CheckSheet_${t.idTicket}.pdf`);
  }

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }
  goToDashboardTeknisi() { this.setActiveMenu('dashboard-teknisi'); this.router.navigate(['/teknisi/dashboard']); }
  goToTicket() { this.setActiveMenu('ticket'); this.router.navigate(['/teknisi/ticket']); }
  goToProsesTiket() { this.setActiveMenu('proses-tiket'); this.router.navigate(['/teknisi/proses']); }
  goToRiwayatTiket() { this.setActiveMenu('riwayat-tiket'); this.router.navigate(['/teknisi/riwayat']); }
  goToScheduleTersedia() { this.setActiveMenu('schedule-tersedia'); this.router.navigate(['/teknisi/schedule-tersedia']); }
  goToPengaturan() { this.setActiveMenu('pengaturan'); }
  goToProfile() { this.setActiveMenu('profile'); this.router.navigate(['/teknisi/profile']); }

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