import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TicketService, TicketApiRow, ChecklistItemApiRow, ChecklistApprovalRow } from '../../services/ticket.service';
import { KategoriService, Kategori } from '../../services/kategori.service';
import { SubKategoriService, SubKategoriRow } from '../../services/sub-kategori.service';
import { AssetService } from '../../services/asset.service';
import { Asset } from '../../models/asset.model';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { environment } from '../../../environments/environment';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).vfs || (pdfFonts as any).pdfMake?.vfs;

export interface MyTicket {
  id: string;
  kategori: string;
  subKategori: string;
  asset: string;
  departemen?: string;
  lampiran: string;
  lampiranPath: string;
  tanggal: string;
  status: string;
  prioritas?: 'Low' | 'Normal' | 'Urgent';
  deadline?: string | null;
  isPaused?: number;
  waktuSelesai?: string | null;
  teknisi?: string | null;
  progress?: number;
  statusPengerjaan?: string;
  catatanPenyelesaian?: string | null;
  userKonfirmasi?: number;
  isPreventive?: boolean;
  tanggalDibuatSchedule?: string | null;
  catatanApproval?: string | null;   // 🔥 BARU: alasan reject dari Admin
}

export interface ChecklistGroup {
  kategori: string;
  items: ChecklistItemApiRow[];
}

export type ChecklistSection =
  | { type: 'header'; label: string }
  | { type: 'group'; kategori: string; items: ChecklistItemApiRow[]; number: number };

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

  isChatModalOpen = false;
  selectedTicketId = '';
  chatMessages: ChatMessage[] = [];
  newChatMessage = '';
  isChatLoading = false;
  selectedChatFile: File | null = null;
  selectedChatFilePreview: string = '';

  isHistoryModalOpen = false;
  selectedTicketHistory: any[] = [];
  isHistoryLoading = false;

  isChecklistModalOpen = false;
  selectedChecklistTicketId = '';
  selectedChecklistTicket: MyTicket | null = null;
  checklistItems: ChecklistItemApiRow[] = [];
  checklistSections: ChecklistSection[] = [];
  selectedChecklistApproval: ChecklistApprovalRow | null = null;
  isLoadingChecklist = false;
  isLoadingApproval = false;
  isSubmittingApproval = false;
  isGeneratingPdf = false;

  private readonly specialSectionLabels: { [kategoriUnit: string]: string } = {
    'Printer/Scanner': 'Kode Assets (Printer / Scanner *)',
    'Network Equipment': 'Kode Assets (Network *)',
  };

  private logoBase64Cache: string | null = null;

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

    this.countdownInterval = setInterval(() => {
      this.myTickets = [...this.myTickets];
    }, 1000);

    this.refreshInterval = setInterval(() => {
      this.loadMyTickets(true);
    }, 1008000);
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

    let tanggalDibuatSchedule: string | null = null;
    const rawScheduleDate = (row as any).tanggal_dibuat_schedule;
    if (rawScheduleDate) {
      const sd = new Date(rawScheduleDate);
      if (!isNaN(sd.getTime())) {
        tanggalDibuatSchedule =
          `${String(sd.getDate()).padStart(2, '0')}-${String(sd.getMonth() + 1).padStart(2, '0')}-${sd.getFullYear()}`;
      }
    }

    return {
      id: row.id_ticket,
      kategori: row.nama_kategori || '-',
      subKategori: row.nama_sub_kategori || '-',
      asset: row.aset || '-',
      departemen: row.dept || '-',
      lampiran: row.lampiran ? 'foto' : '-',
      lampiranPath: row.lampiran || '',
      tanggal,
      status: row.status || '-',
      prioritas: row.prioritas || 'Normal',
      deadline: row.deadline || null,
      isPaused: row.is_paused ?? 0,
      waktuSelesai,
      teknisi: row.teknisi || null,
      progress: row.progress ?? 0,
      statusPengerjaan: row.status_pengerjaan || 'Menunggu Diproses',
      catatanPenyelesaian: row.catatan_penyelesaian || null,
      userKonfirmasi: row.user_konfirmasi ?? 0,
      isPreventive: !!(row as any).deskripsi && (row as any).deskripsi.includes('[PREVENTIVE]'),
      tanggalDibuatSchedule,
      catatanApproval: (row as any).catatan_approval || null,   // 🔥 BARU
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

  // 🔥 FIX: 'reject' -> 'rejected' supaya cocok dengan status asli dari backend
  getStatusText(status: string): string {
    if (!status) return '-';
    const s = status.toLowerCase();
    if (s === 'solved') return 'Selesai';
    if (s.includes('approve')) return 'Approve Internal';
    if (s.includes('menunggu')) return 'Menunggu Approval';
    if (s === 'reject' || s === 'rejected') return 'Ditolak';
    if (s.includes('proses')) return 'On Process';
    return status;
  }

  // 🔥 FIX: sama seperti di atas
  getStatusClass(status: string): string {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s === 'solved' || s === 'selesai') return 'status-success';
    if (s.includes('approve')) return 'status-primary';
    if (s.includes('menunggu')) return 'status-warning';
    if (s === 'reject' || s === 'rejected' || s === 'ditolak') return 'status-danger';
    if (s.includes('proses')) return 'status-info';
    return '';
  }

  // 🔥 BARU: helper dipanggil dari HTML buat cek apakah tiket ditolak
  isRejected(status: string): boolean {
    if (!status) return false;
    const s = status.toLowerCase();
    return s === 'reject' || s === 'rejected';
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

  approveTicket(idTicket: string) {
    if (!confirm('Apakah perbaikan sudah sesuai dan Anda ingin approve tiket ini?')) return;

    this.ticketService.confirmByUser(idTicket).subscribe({
      next: () => {
        alert('Tiket berhasil di-approve. Terima kasih!');
        this.loadMyTickets();
      },
      error: (err: any) => {
        console.error('Gagal approve tiket', err);
        alert(err?.error?.message || 'Gagal approve tiket');
      },
    });
  }

  openChecklistModal(idTicket: string) {
    this.selectedChecklistTicketId = idTicket;
    this.selectedChecklistTicket = this.myTickets.find(t => t.id === idTicket) || null;
    this.isChecklistModalOpen = true;
    this.checklistItems = [];
    this.checklistSections = [];
    this.selectedChecklistApproval = null;

    this.isLoadingChecklist = true;
    this.ticketService.getChecklist(idTicket).subscribe({
      next: (data: ChecklistItemApiRow[]) => {
        this.checklistItems = data || [];
        this.checklistSections = this.buildChecklistSections(this.checklistItems);
        this.isLoadingChecklist = false;
      },
      error: (err: any) => {
        console.error('Gagal memuat checklist', err);
        this.isLoadingChecklist = false;
      }
    });

    this.loadChecklistApproval(idTicket);
  }

  closeChecklistModal() {
    this.isChecklistModalOpen = false;
    this.selectedChecklistTicketId = '';
    this.selectedChecklistTicket = null;
    this.checklistItems = [];
    this.checklistSections = [];
    this.selectedChecklistApproval = null;
  }

  private buildChecklistSections(items: ChecklistItemApiRow[]): ChecklistSection[] {
    const map = new Map<string, ChecklistItemApiRow[]>();
    for (const item of items) {
      if (!map.has(item.kategori_unit)) map.set(item.kategori_unit, []);
      map.get(item.kategori_unit)!.push(item);
    }

    const sections: ChecklistSection[] = [];
    let normalCounter = 0;

    map.forEach((groupItems, kategori) => {
      const sectionLabel = this.specialSectionLabels[kategori];
      if (sectionLabel) {
        sections.push({ type: 'header', label: sectionLabel });
        sections.push({ type: 'group', kategori, items: groupItems, number: 1 });
      } else {
        normalCounter++;
        sections.push({ type: 'group', kategori, items: groupItems, number: normalCounter });
      }
    });

    return sections;
  }

  trackBySection(index: number, section: ChecklistSection): string {
    return section.type === 'header' ? `header-${section.label}` : `group-${section.kategori}`;
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
        console.error('Gagal memuat status approval', err);
        this.isLoadingApproval = false;
      }
    });
  }

  getApprovalStageLabel(): string {
    const a = this.selectedChecklistApproval;
    if (!a || !a.dibuat_oleh_nik) return 'Menunggu Teknisi mengajukan Check Sheet';
    if (a.status_diketahui === 'Reject') return 'Anda menolak Check Sheet ini';
    if (a.status_diketahui !== 'Approve') return 'Menunggu approval Anda';
    return 'Disetujui — PDF sudah bisa didownload';
  }

  get canApproveChecklist(): boolean {
    const a = this.selectedChecklistApproval;
    return !!a?.dibuat_oleh_nik && a.status_diketahui !== 'Approve';
  }

  approveChecklist(action: 'Approve' | 'Reject') {
    const label = action === 'Approve' ? 'menyetujui' : 'menolak';
    let catatan = '';

    if (action === 'Reject') {
      catatan = prompt('Alasan penolakan (wajib diisi):') || '';
      if (!catatan.trim()) {
        alert('Alasan penolakan wajib diisi.');
        return;
      }
    }

    if (!confirm(`Apakah Anda yakin ingin ${label} Check Sheet ini?`)) return;

    this.isSubmittingApproval = true;
    this.ticketService.approveChecklistByUser(this.selectedChecklistTicketId, action, catatan).subscribe({
      next: () => {
        this.isSubmittingApproval = false;
        alert(`Check Sheet berhasil di-${label}.`);
        this.loadChecklistApproval(this.selectedChecklistTicketId);
        this.loadMyTickets();
      },
      error: (err: any) => {
        this.isSubmittingApproval = false;
        alert(err?.error?.message || `Gagal ${label} Check Sheet`);
      }
    });
  }

  getSignatureUrl(path: string | null | undefined): string {
    if (!path) return '';
    const uploadsBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${uploadsBase}${path}`;
  }

  private buildCheckmark() {
    return {
      canvas: [
        {
          type: 'polyline',
          lineWidth: 1.5,
          closePath: false,
          points: [
            { x: 0, y: 4 },
            { x: 3, y: 7 },
            { x: 8, y: 0 },
          ],
        },
      ],
      alignment: 'center',
      margin: [0, 3, 0, 0],
    };
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

  private getHeaderTanggalText(): string {
    if (this.selectedChecklistTicket?.tanggalDibuatSchedule) {
      return this.selectedChecklistTicket.tanggalDibuatSchedule;
    }
    return '-';
  }

  async downloadChecklistPdf() {
    if (!this.checklistItems || this.checklistItems.length === 0) {
      alert('Checklist belum dimuat. Buka Check Sheet dulu sebelum export PDF.');
      return;
    }

    const approval = this.selectedChecklistApproval;
    if (!approval || approval.status_diketahui !== 'Approve') {
      alert('PDF hanya bisa di-export setelah Check Sheet disetujui.');
      return;
    }

    const t = this.selectedChecklistTicket;
    this.isGeneratingPdf = true;

    try {
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
      for (const item of this.checklistItems) {
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
            item.kondisi === 'OK' ? this.buildCheckmark() : { text: '' },
            item.kondisi === 'NC'
              ? (item.kondisi_huruf
                  ? { text: item.kondisi_huruf, alignment: 'center', fontSize: 9, bold: true }
                  : this.buildCheckmark())
              : { text: '' },
            { text: item.catatan || '', fontSize: 7 },
          ]);
        });
      });

      const headerLogo: any = logoBase64
        ? { image: logoBase64, width: 55, margin: [4, 8, 0, 0] }
        : { text: '', width: 55 };

      const fmtTgl = (d: string | null) => d ? new Date(d).toLocaleDateString('id-ID') : '-';

      const buildSignatureCell = (ttdBase64: string, nama: string | null, tanggal: string | null) => {
        const stack: any[] = [];
        if (ttdBase64) {
          stack.push({ image: ttdBase64, width: 60, height: 26, alignment: 'center', margin: [0, 2, 0, 2] });
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
              widths: [55, '*', 140],
              body: [[
                headerLogo,
                {
                  stack: [
                    { text: 'CHECK SHEET', bold: true, fontSize: 14, alignment: 'center' },
                    { text: 'PERSONAL COMPUTER,SOFTWARE', fontSize: 9, alignment: 'center' },
                    { text: 'PRINTER,SCANNER & NETWORK', fontSize: 9, alignment: 'center' },
                  ],
                  margin: [0, 8, 0, 0],
                },
                {
                  stack: [
                    { text: 'No.Form : FRM/IT/CS/001', fontSize: 8 },
                    { text: 'No.Rev : 00', fontSize: 8 },
                    { text: `Tanggal : ${this.getHeaderTanggalText()}`, fontSize: 8 },
                  ],
                  margin: [4, 8, 0, 0],
                },
              ]],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          {
            table: {
              widths: [160, '*'],
              body: [
                ['Tanggal Pelaksanaan', `: ${new Date().toLocaleDateString('id-ID')}`],
                ['IT Propertis', `: ${t?.asset || '-'}`],
                ['Department', `: ${t?.departemen || '-'}`],
                ['Sub Department', `: ${t?.subKategori || '-'}`],
              ].map(([label, value]) => [
                { text: label, fontSize: 9, margin: [4, 4, 0, 4] },
                { text: value, fontSize: 9, margin: [4, 4, 0, 4] },
              ]),
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
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
              body: [[
                {
                  stack: [
                    { text: 'Catatan:', bold: true, fontSize: 7 },
                    { text: 'B : Masih dapat beroperasi, dan masih bisa dipertahankan, sampai waktu disiapkan dan persiapan sparepart', fontSize: 7 },
                    { text: 'C : Segera diperbaiki atau harus segera diperbaiki dan waktu perbaikan ditentukan ITS', fontSize: 7 },
                    { text: 'D : Harus berhenti / tidak mampu berkerja', fontSize: 7 },
                  ],
                  margin: [4, 4, 4, 4],
                },
                {
                  stack: [
                    { text: 'Kondisi NC :', bold: true, fontSize: 7 },
                    { text: 'B : Masih Baik', fontSize: 7 },
                    { text: 'C : Segera Diperbaiki', fontSize: 7 },
                    { text: 'D : Harus diganti', fontSize: 7 },
                  ],
                  margin: [4, 4, 4, 4],
                },
              ]],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
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
                  { text: (t?.status || '-').toUpperCase(), alignment: 'center', margin: [0, 20, 0, 20], fontSize: 9 },
                  buildSignatureCell(ttdDibuat, approval.nama_dibuat_oleh, approval.tanggal_dibuat),
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

      pdfMake.createPdf(docDefinition).download(`CheckSheet_${this.selectedChecklistTicketId}.pdf`);
    } catch (e) {
      console.error('Gagal generate PDF', e);
      alert('Gagal membuat PDF, coba lagi.');
    } finally {
      this.isGeneratingPdf = false;
    }
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
  goToInputAset() { this.setActiveMenu('input-aset'); this.router.navigate(['/users/input-aset']); }
  goToLaporanFeedback() { this.setActiveMenu('laporan-feedback'); this.router.navigate(['/users/feedback']); }
  goToPengaturan() { this.setActiveMenu('pengaturan'); this.router.navigate(['/users/settings']); }
  logout() { localStorage.clear(); this.router.navigate(['/login']); }
  goToProfile() { this.router.navigate(['/users/profile']); }
  getPageTitle(): string { return 'My Ticket'; }
}