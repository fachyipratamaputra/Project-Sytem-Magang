import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonBackButton,
  IonMenuButton,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonProgressBar,
  IonModal,
  IonButtons,
  IonFooter,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonRefresher,
  IonRefresherContent,
  IonCheckbox,
  IonPopover,
  IonDatetime,
} from '@ionic/angular/standalone';
import { ScheduleService, DepartmentSchedule, Schedule } from '../../services/schedule.service';
import { DepartemenService } from '../../services/departemen.services';
import { TeknisiService } from '../../services/teknisi.service';
import { InventoryService } from '../../services/inventory.service';
import { TicketService } from '../../services/ticket.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface TimelineDay {
  date: Date;
  label: string;
  isToday: boolean;
  isWeekend: boolean;
}

export interface TimelineMonthGroup {
  label: string;
  span: number;
}

export interface GanttRow {
  label: string;
  isHeader: boolean;
  totalAset: number;
  scheduleCount: number;
  startDate: Date;
  endDate: Date;
  status: 'plan' | 'progress' | 'approve' | 'userapprove';
  teknisi: string;
  id_schedule?: number;
  departemen?: string;
}

// 🔥 BARU — hasil parse teknisi_klaim: siapa ngerjain berapa aset
export interface TeknisiKlaimItem {
  nama: string;
  jumlah: number;
}

// ============================================================
// 🔧 HELPER TANGGAL (module-level, dipakai di seluruh komponen)
// 🔧 FIXED (BUG "tanggal mulai balik ke hari ini"):
// - todayDateStr()   -> tanggal hari ini dalam format lokal 'YYYY-MM-DD'
//   (BUKAN new Date().toISOString() yang berbasis UTC dan bisa geser
//   ±1 hari tergantung timezone browser, mis. WIB/UTC+7).
// - toLocalDateStr() -> normalisasi input apapun (Date object, ISO
//   string dengan waktu, atau string 'YYYY-MM-DD' polos) selalu jadi
//   'YYYY-MM-DD' lokal yang konsisten dipakai di ion-datetime, payload
//   ke backend, dan perbandingan tanggal.
// ============================================================
function todayDateStr(): string {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
}

function toLocalDateStr(input: any): string {
  if (!input) return '';
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }
  const d = new Date(input);
  if (isNaN(d.getTime())) return '';
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonBackButton,
    IonMenuButton,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonItem,
    IonLabel,
    IonList,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonProgressBar,
    IonModal,
    IonButtons,
    IonFooter,
    IonText,
    IonSegment,
    IonSegmentButton,
    IonRefresher,
    IonRefresherContent,
    IonCheckbox,
    IonPopover,
    IonDatetime,
  ],
})
export class SchedulePage implements OnInit, OnDestroy {
  // ===== STATE =====
  viewMode: 'list' | 'detail' = 'list';
  isSidebarOpen = false;
  activeMenu = 'schedule';
  isLoading = false;
  errorMessage = '';

  // ===== FILTER =====
  searchTerm = '';
  filterDept = '';
  filterStatus = '';

  // ===== PERIOD FILTER =====
  selectedPeriod: 'monthly' | 'yearly' = 'monthly';
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  monthOptions = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  yearOptions: number[] = [];

  // ===== DATA =====
  departments: DepartmentSchedule[] = [];
  filteredDepartments: DepartmentSchedule[] = [];
  selectedDepartment: DepartmentSchedule | null = null;

  // ===== DROPDOWN OPTIONS =====
  satuanOptions: ('hari')[] = ['hari'];
  departemenOptions: any[] = [];
  teknisiOptions: any[] = [];
  allAssets: any[] = [];
  availableAssets: any[] = [];

  checklistKategoriOptions: string[] = ['CPU', 'Monitor', 'Software', 'Printer/Scanner', 'Network Equipment'];

  // ===== MODAL CRUD =====
  isModalOpen = false;
  isEditing = false;
  // 🔥 GANTI: tidak ada lagi id_teknisi_utama/id_teknisi_pendamping (bukan kolom asli).
  // id_teknis & teknisi_list sekarang cuma DIBACA (read-only) untuk ditampilkan
  // di status box, TIDAK PERNAH dikirim balik ke backend dari sini.
  // 🔧 FIXED: tanggal_mulai default pakai todayDateStr() (format 'YYYY-MM-DD'
  // lokal), BUKAN new Date().toISOString() (UTC, bisa geser hari).
  formData: any = {
    id: null,
    nama: '',
    id_departemen: null,
    tanggal_mulai: todayDateStr(),
    tanggal_selesai: '',
    deskripsi: '',
    aset_list: [],
    checklist_kategori: [],
    id_teknis: [] as string[],
    teknisi_list: '',
  };

  // ===== MODAL ASET =====
  isAssetModalOpen = false;
  assetModalScheduleId: number | null = null;
  assetModalScheduleName = '';
  assetList: any[] = [];
  assetSearchQuery = '';
  filteredAssetList: any[] = [];
  assetCurrentPage = 1;
  assetPageSize = 10;

  // ===== CHART DATA =====
  chartData: any[] = [];
  totalPcPreventive = 0;

  // ===== REKAPAN DATA =====
  rekapanData: any[] = [];
  rekapanFilterDept = '';

  // ===== GANTT CHART PROPERTIES =====
  timelineDays: TimelineDay[] = [];
  timelineMonthGroups: TimelineMonthGroup[] = [];
  viewStartDate!: Date;
  viewEndDate!: Date;
  ganttRows: GanttRow[] = [];

  @ViewChild('ganttScroll') ganttScrollRef!: ElementRef<HTMLDivElement>;
  private isDragging = false;
  private dragStartX = 0;
  private dragScrollLeft = 0;
  private hasInitialScrolled = false;

  // ===== MODAL DETAIL STATUS =====
  isStatusModalOpen = false;
  statusModalTitle = '';
  statusModalItems: any[] = [];
  statusModalLoading = false;
  statusModalStartDate: Date | null = null;
  statusModalEndDate: Date | null = null;
  statusModalDurationDays = 0;

  private refreshInterval: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private scheduleService: ScheduleService,
    private departemenService: DepartemenService,
    private teknisiService: TeknisiService,
    private inventoryService: InventoryService,
    private ticketService: TicketService
  ) {}

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

    this.loadDropdownOptions();
    this.loadData();

    // 🔧 FIXED: skip auto-refresh selagi ada modal yang sedang terbuka,
    // supaya proses isi form (termasuk pilih tanggal di datetime popover)
    // tidak terganggu / ter-reset oleh reload data background tiap 10 detik.
    this.refreshInterval = setInterval(() => {
      if (this.isModalOpen || this.isStatusModalOpen || this.isAssetModalOpen) return;
      this.loadData(true);
    }, 10000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.subscriptions.unsubscribe();
  }

  // ===== LOAD DATA =====
  loadData(isBackgroundRefresh = false) {
    if (!isBackgroundRefresh) {
      this.isLoading = true;
    }
    this.errorMessage = '';

    const sub = forkJoin({
      departments: this.scheduleService.getDepartmentsWithSchedules().pipe(catchError(() => of([]))),
      teknisi: this.teknisiService.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res: any) => {
        const rawTeknisi = res.teknisi;
        this.teknisiOptions = Array.isArray(rawTeknisi) ? rawTeknisi : (rawTeknisi?.data || []);

        this.departments = res.departments || [];
        this.filteredDepartments = res.departments || [];

        this.isLoading = false;
        this.onFilterChange();

        if (!isBackgroundRefresh) {
          this.debugLogStatuses();
        }

        if (!this.hasInitialScrolled) {
          this.scrollGanttToToday();
          this.hasInitialScrolled = true;
        }
      },
      error: (err: any) => {
        console.error('Gagal load data', err);
        this.errorMessage = 'Gagal memuat data schedule.';
        this.isLoading = false;
      },
    });

    this.subscriptions.add(sub);
  }

  // ===== PULL-TO-REFRESH =====
  doRefresh(event: any) {
    this.loadData();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  // ===== PERIOD FILTER =====
  isScheduleInPeriod(schedule: any): boolean {
    const s = schedule as any;
    const rawStart = s.tanggal_mulai || s.tanggal_assign || s.tanggal_lapor || schedule.created_at;
    if (!rawStart) return true;

    const startDate = new Date(rawStart);
    if (isNaN(startDate.getTime())) return true;

    let endDate: Date;
    if (s.tanggal_selesai || s.end_date) {
      endDate = new Date(s.tanggal_selesai || s.end_date);
    } else {
      let durationDays = s.durasi_hari || schedule.frekuensi || 1;
      if (schedule.satuan === 'minggu') durationDays *= 7;
      else if (schedule.satuan === 'bulan') durationDays *= 30;
      else if (schedule.satuan === 'tahun') durationDays *= 365;
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);
    }

    const yr = Number(this.selectedYear);
    let periodStart: Date;
    let periodEnd: Date;

    if (this.selectedPeriod === 'monthly') {
      const mn = Number(this.selectedMonth);
      periodStart = new Date(yr, mn - 1, 1);
      const daysInMonth = new Date(yr, mn, 0).getDate();
      periodEnd = new Date(yr, mn - 1, daysInMonth, 23, 59, 59);
    } else {
      periodStart = new Date(yr, 0, 1);
      periodEnd = new Date(yr, 11, 31, 23, 59, 59);
    }

    return startDate <= periodEnd && endDate >= periodStart;
  }

  // ===== DETERMINE STATUS =====
  private determineStatus(sched: any): 'plan' | 'progress' | 'approve' | 'userapprove' {
    const rawStatus = (
      sched.status ||
      sched.status_pengerjaan ||
      sched.status_schedule ||
      sched.state ||
      ''
    )
      .toString()
      .toLowerCase()
      .trim();

    if (sched.user_confirmed === 1 || sched.user_confirmed === true) {
      return 'userapprove';
    }

    if (
      ['approve', 'approved', 'complete', 'completed', 'selesai', 'solved', 'done'].includes(rawStatus) ||
      sched.is_approved === true ||
      sched.is_approved === 1
    ) {
      return 'approve';
    }

    if (
      ['progress', 'inprogress', 'in progress', 'in_progress', 'proses', 'on process', 'on_process', 'working', 'pending'].includes(rawStatus) ||
      (sched.completed_aset > 0 && sched.completed_aset < (sched.total_aset || 1)) ||
      (sched.progress_percent > 0 && sched.progress_percent < 100)
    ) {
      return 'progress';
    }

    return 'plan';
  }

  private debugLogStatuses() {
    console.log('%c=== DEBUG STATUS SCHEDULE ===', 'color: blue; font-weight: bold;');
    for (const dept of this.departments) {
      if (!dept.schedules) continue;
      for (const sched of dept.schedules) {
        const s = sched as any;
        const computedStatus = this.determineStatus(s);
        console.log(
          `[${computedStatus.toUpperCase()}] ${dept.nama_departemen} - ${sched.nama_schedule}`,
          s
        );
      }
    }
  }

  // ============================================================
  // 🔥 BARU — parse field teknisi_klaim dari backend, format:
  // "Bagas:1||Putra:1" -> [{ nama: 'Bagas', jumlah: 1 }, { nama: 'Putra', jumlah: 1 }]
  // Ini data klaim per-asset yang SEBENARNYA (dari schedule_asset_claim),
  // beda dari teknisi_list (assign manual lama yang cuma gabungan nama).
  // Sama persis dengan logic yang sudah dipakai di halaman Teknisi
  // (schedule-tersedia), supaya kolom TEKNISI di tabel rekapan Admin
  // juga bisa menampilkan split multi-teknisi ("Putra (2/3 aset)").
  // ============================================================
  private parseTeknisiKlaim(raw: any): TeknisiKlaimItem[] {
    if (!raw || typeof raw !== 'string') return [];
    return raw
      .split('||')
      .map((entry) => {
        const idx = entry.lastIndexOf(':');
        if (idx === -1) return null;
        const nama = entry.slice(0, idx).trim();
        const jumlah = parseInt(entry.slice(idx + 1).trim(), 10);
        if (!nama || isNaN(jumlah)) return null;
        return { nama, jumlah };
      })
      .filter((x): x is TeknisiKlaimItem => x !== null);
  }

  // ===== BUILD CHART, REKAPAN & GANTT =====
  buildChartData() {
    if (!this.filteredDepartments || this.filteredDepartments.length === 0) {
      this.chartData = [];
      this.totalPcPreventive = 0;
      this.rekapanData = [];
      this.ganttRows = [];
      this.generateTimeline();
      return;
    }

    const allItems: any[] = [];
    const rekapanItems: any[] = [];
    const ganttSource: any[] = [];
    let totalAsset = 0;

    for (const dept of this.filteredDepartments) {
      if (!dept.schedules) continue;

      for (const sched of dept.schedules) {
        if (!sched.is_active) continue;
        if (!this.isScheduleInPeriod(sched)) continue;

        const s = sched as any;
        const totalAset = sched.total_aset || 0;
        totalAsset += totalAset;

        const status = this.determineStatus(s);

        const selesaiCount = s.completed_aset ?? (status === 'approve' ? totalAset : 0);
        const prosesCount = status === 'progress' ? Math.max(1, totalAset - selesaiCount) : 0;
        const belumCount = Math.max(0, totalAset - selesaiCount - prosesCount);

        allItems.push({
          id_schedule: sched.id_schedule,
          departemen: dept.nama_departemen,
          nama_schedule: sched.nama_schedule || s.nama || '-',
          total_aset: totalAset,
          belum_count: belumCount,
          proses_count: prosesCount,
          selesai_count: selesaiCount,
          status,
        });

        const rawStart = s.tanggal_mulai || s.tanggal_assign || s.tanggal_lapor || sched.created_at;
        const startDate = rawStart ? new Date(rawStart) : new Date();

        let endDate: Date;
        let durationDays = 0;

        if (s.tanggal_selesai || s.end_date) {
          endDate = new Date(s.tanggal_selesai || s.end_date);
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        } else {
          durationDays = s.durasi_hari || sched.frekuensi || 1;
          if (sched.satuan === 'minggu') durationDays *= 7;
          else if (sched.satuan === 'bulan') durationDays *= 30;
          else if (sched.satuan === 'tahun') durationDays *= 365;
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + durationDays);
        }

        // 🔥 BARU — PRIORITAS 1: data klaim per-asset asli (schedule_asset_claim),
        // menunjukkan siapa ngerjain berapa aset di schedule ini. Sama seperti
        // di halaman Teknisi, ini dicoba dulu sebelum fallback ke skema lama.
        const teknisiKlaim = this.parseTeknisiKlaim(s.teknisi_klaim);

        let teknisiNames: string[] = [];

        if (teknisiKlaim.length > 0) {
          teknisiNames = teknisiKlaim.map((tk) => `${tk.nama} (${tk.jumlah} aset)`);
        } else {
          // FALLBACK: skema assign manual lama (id_teknis / teknisi_list)
          const rawCandidates = [
            sched.teknisi_list,
            s.teknisi,
            s.nama_teknisi,
            s.user_teknisi,
            s.nama_user,
            s.teknisis,
            s.users,
            s.teknisi_detail
          ];

          const extractName = (val: any) => {
            if (!val) return;
            if (typeof val === 'string' && val.trim()) {
              teknisiNames.push(val.trim());
            } else if (typeof val === 'object' && val !== null) {
              if (Array.isArray(val)) {
                val.forEach(extractName);
              } else {
                const name = val.nama_teknisi || val.nama || val.nama_lengkap || val.name || val.username;
                if (name) teknisiNames.push(String(name).trim());
              }
            }
          };

          rawCandidates.forEach(extractName);
          teknisiNames = Array.from(new Set(teknisiNames));

          if (teknisiNames.length === 0 && Array.isArray(s.id_teknis) && s.id_teknis.length > 0 && this.teknisiOptions.length > 0) {
            s.id_teknis.forEach((tid: string) => {
              const found = this.teknisiOptions.find((t: any) => String(t.idTeknisi) === String(tid));
              if (found) {
                const name = (found as any).nama;
                if (name) teknisiNames.push(String(name).trim());
              }
            });
          }
        }

        let teknisi = teknisiNames.length > 0 ? teknisiNames.join(', ') : 'Belum diklaim';

        // 🔧 FIXED: tambah id_schedule & id_departemen di rekItem, supaya
        // tabel Rekapan (halaman list utama) bisa punya tombol Edit/Hapus
        // langsung tanpa harus masuk ke viewMode 'detail' dulu.
        const rekItem = {
          id_schedule: sched.id_schedule,
          id_departemen: dept.id_departemen,
          departemen: dept.nama_departemen,
          schedule: sched.nama_schedule || sched.nama || '-',
          totalAset,
          durationDays,
          startDate,
          endDate,
          teknisi,
          teknisiKlaim, // 🔥 BARU — dipakai HTML untuk render badge per-teknisi
        };

        rekapanItems.push(rekItem);
        ganttSource.push({
          ...rekItem,
          status,
          id_schedule: sched.id_schedule,
        });
      }
    }

    this.totalPcPreventive = totalAsset;
    this.chartData = allItems;
    this.rekapanData = rekapanItems;

    if (this.rekapanFilterDept && !rekapanItems.some((item) => item.departemen === this.rekapanFilterDept)) {
      this.rekapanFilterDept = '';
    }

    this.buildGanttRows(ganttSource);
    this.generateTimeline();
  }

  // ===== FILTER REKAPAN =====
  get rekapanDeptOptions(): string[] {
    const names = this.rekapanData.map((item) => item.departemen).filter((n) => !!n);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }

  get filteredRekapanData(): any[] {
    if (!this.rekapanFilterDept) return this.rekapanData;
    return this.rekapanData.filter((item) => item.departemen === this.rekapanFilterDept);
  }

  getRekapanCountByDept(dept: string): number {
    return this.rekapanData.filter((item) => item.departemen === dept).length;
  }

  onRekapanFilterChange() {}

  // ============================================================
  // 🔥 BARU — Edit / Hapus langsung dari tabel Rekapan (halaman list
  // utama), tanpa perlu masuk ke viewMode 'detail' dulu. Schedule asli
  // dicari lagi dari this.departments (bukan dari rekItem, yang cuma
  // data ringkasan) supaya editSchedule() dapat objek Schedule lengkap.
  // ============================================================
  private findScheduleByIds(idDepartemen: number, idSchedule: number): Schedule | null {
    const dept = this.departments.find((d) => d.id_departemen === idDepartemen);
    if (!dept || !dept.schedules) return null;
    return dept.schedules.find((s: any) => s.id_schedule === idSchedule) || null;
  }

  editFromRekapan(item: any) {
    const sched = this.findScheduleByIds(item.id_departemen, item.id_schedule);
    if (!sched) {
      alert('Schedule tidak ditemukan, coba refresh halaman.');
      return;
    }
    this.editSchedule(sched);
  }

  hapusFromRekapan(item: any) {
    const sched = this.findScheduleByIds(item.id_departemen, item.id_schedule);
    if (!sched) {
      alert('Schedule tidak ditemukan, coba refresh halaman.');
      return;
    }
    this.deleteSchedule(sched);
  }

  // ===== GANTT ROWS =====
  buildGanttRows(items: any[]) {
    const rows: GanttRow[] = [];

    for (const item of items) {
      const scheduleName = item.schedule && item.schedule !== '-' ? item.schedule : '';
      const displayLabel = scheduleName ? `${item.departemen} - ${scheduleName}` : item.departemen;

      rows.push({
        label: displayLabel,
        isHeader: false,
        totalAset: item.totalAset,
        scheduleCount: 1,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status,
        teknisi: item.teknisi || 'Belum diklaim',
        id_schedule: item.id_schedule,
        departemen: item.departemen,
      });
    }

    this.ganttRows = rows;
  }

  // ===== GENERATE TIMELINE =====
  generateTimeline() {
    this.timelineDays = [];
    this.timelineMonthGroups = [];

    const yr = Number(this.selectedYear);
    const mn = Number(this.selectedMonth);

    if (this.selectedPeriod === 'monthly') {
      const daysInMonth = new Date(yr, mn, 0).getDate();
      this.viewStartDate = new Date(yr, mn - 1, 1);
      this.viewEndDate = new Date(yr, mn - 1, daysInMonth, 23, 59, 59);
    } else {
      this.viewStartDate = new Date(yr, 0, 1);
      this.viewEndDate = new Date(yr, 11, 31, 23, 59, 59);
    }

    this.buildTimelineFromRange(this.viewStartDate, this.viewEndDate);
  }

  private buildTimelineFromRange(start: Date, end: Date) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const today = new Date();
    const days: TimelineDay[] = [];
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    const last = new Date(end);
    last.setHours(0, 0, 0, 0);

    while (cursor <= last) {
      const dayOfWeek = cursor.getDay();
      days.push({
        date: new Date(cursor),
        label: cursor.getDate().toString().padStart(2, '0'),
        isToday:
          cursor.getFullYear() === today.getFullYear() &&
          cursor.getMonth() === today.getMonth() &&
          cursor.getDate() === today.getDate(),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    this.timelineDays = days;

    const groups: TimelineMonthGroup[] = [];
    for (const d of days) {
      const label = `${monthNames[d.date.getMonth()]} ${d.date.getFullYear()}`;
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.label === label) {
        lastGroup.span++;
      } else {
        groups.push({ label, span: 1 });
      }
    }
    this.timelineMonthGroups = groups;
  }

  scrollGanttToToday() {
    if (!this.ganttScrollRef || this.timelineDays.length === 0) return;
    const idx = this.timelineDays.findIndex((d) => d.isToday);
    const targetIdx = idx >= 0 ? idx : 0;
    const colWidth = 34;
    const stickyOffset = 360;

    setTimeout(() => {
      const el = this.ganttScrollRef?.nativeElement;
      if (el) {
        el.scrollLeft = Math.max(0, targetIdx * colWidth - stickyOffset);
      }
    }, 50);
  }

  // ===== GANTT STYLE =====
  getGanttBarStyle(startDate: Date, endDate: Date) {
    if (!this.viewStartDate || !this.viewEndDate || !startDate || !endDate) {
      return { display: 'none' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { display: 'none' };
    }

    const viewStart = this.viewStartDate.getTime();
    const viewEnd = this.viewEndDate.getTime();
    const viewDuration = viewEnd - viewStart;
    if (!viewDuration) return { display: 'none' };

    const itemStart = start.getTime();
    const itemEnd = end.getTime();
    if (itemEnd < viewStart || itemStart > viewEnd) {
      return { display: 'none' };
    }

    const visibleStart = Math.max(itemStart, viewStart);
    const visibleEnd = Math.min(itemEnd, viewEnd);
    const leftPercent = ((visibleStart - viewStart) / viewDuration) * 100;
    const widthPercent = ((visibleEnd - visibleStart) / viewDuration) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 1)}%`,
    };
  }

  getGanttStatusClass(status: string): string {
    if (!status) return 'gantt-bar-plan status-plan';
    const s = status.toLowerCase().trim();

    if (['userapprove', 'user_approve', 'user-approve'].includes(s)) {
      return 'gantt-bar-userapprove status-userapprove';
    }
    if (['progress', 'inprogress', 'in progress', 'in_progress', 'proses', 'on process'].includes(s)) {
      return 'gantt-bar-progress status-inprogress';
    }
    if (['approve', 'approved', 'complete', 'completed', 'selesai', 'solved'].includes(s)) {
      return 'gantt-bar-approve status-approve';
    }
    return 'gantt-bar-plan status-plan';
  }

  getGanttBarIcon(status: string): string {
    const s = (status || '').toLowerCase().trim();
    if (['userapprove', 'user_approve', 'user-approve'].includes(s)) {
      return 'shield-checkmark';
    }
    if (['progress', 'inprogress', 'in progress', 'in_progress', 'proses', 'on process'].includes(s)) {
      return 'alert-circle';
    }
    if (['approve', 'approved', 'complete', 'completed', 'selesai', 'solved'].includes(s)) {
      return 'checkmark-circle';
    }
    return 'time-outline';
  }

  trackByDay(index: number, day: TimelineDay) {
    return day?.date?.getTime() || index;
  }

  trackByRowId(index: number, row: GanttRow) {
    return row?.id_schedule || row?.label || index;
  }

  trackBySchedule(index: number, schedule: Schedule) {
    return schedule?.id_schedule || index;
  }

  formatDate(dateString: string | Date | undefined | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? String(dateString)
      : date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  calculateDurationDays(start: Date | string | null, end: Date | string | null): number {
    if (!start || !end) return 0;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e)) return 0;
    const diff = Math.abs(e - s);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getAssetProgressLabel(asset: any): string {
    if (!asset?.tanggal_mulai_progress) return 'Belum dimulai';

    const startLabel = this.formatDate(asset.tanggal_mulai_progress);
    const isSelesai = asset.status_pengerjaan_asset === 'Selesai' && asset.tanggal_selesai_progress;
    const endDate = isSelesai ? asset.tanggal_selesai_progress : new Date();
    const endLabel = isSelesai ? this.formatDate(asset.tanggal_selesai_progress) : 'sekarang';
    const days = this.calculateDurationDays(asset.tanggal_mulai_progress, endDate);

    return `${startLabel} - ${endLabel} (${days} hari)`;
  }

  getAssetSelesaiLabel(asset: any): string {
    if (asset?.status_pengerjaan_asset === 'Selesai' && asset.tanggal_selesai_progress) {
      return this.formatDate(asset.tanggal_selesai_progress);
    }
    return 'Belum selesai';
  }

  getStatusColor(schedule: Schedule): string {
    return schedule.is_active ? 'success' : 'medium';
  }

  getStatusBadge(schedule: Schedule): string {
    return schedule.is_active ? 'Aktif' : 'Nonaktif';
  }

  getProgress(schedule: Schedule): number {
    const s = schedule as any;
    const totalAset = schedule.total_aset || 1;
    const completedAset = Math.min(s.completed_aset ?? 0, totalAset);
    return Math.round((completedAset / totalAset) * 100);
  }

  get pagedAssetList(): any[] {
    const start = (this.assetCurrentPage - 1) * this.assetPageSize;
    return this.filteredAssetList.slice(start, start + this.assetPageSize);
  }

  get assetTotalPages(): number {
    return Math.ceil(this.filteredAssetList.length / this.assetPageSize) || 1;
  }

  assetPrevPage() {
    if (this.assetCurrentPage > 1) {
      this.assetCurrentPage--;
    }
  }

  assetNextPage() {
    if (this.assetCurrentPage < this.assetTotalPages) {
      this.assetCurrentPage++;
    }
  }

  openDetailAset(row: GanttRow) {
    if (!row) return;
    const title = row.label;
    let statusText = '';
    if (row.status === 'plan') statusText = 'Belum Dikerjakan';
    else if (row.status === 'progress') statusText = 'In Progress';
    else if (row.status === 'approve') statusText = 'Selesai';
    else if (row.status === 'userapprove') statusText = 'Disetujui User';

    this.statusModalTitle = `${title} - ${statusText}`;
    this.statusModalItems = [];
    this.statusModalLoading = true;
    this.isStatusModalOpen = true;

    this.statusModalStartDate = row.startDate;
    this.statusModalEndDate = row.endDate;
    this.statusModalDurationDays = this.calculateDurationDays(row.startDate, row.endDate);

    let scheduleIds: number[] = [];
    if (row.isHeader && row.departemen) {
      const deptSchedules = this.chartData.filter(
        (item) => item.departemen === row.departemen && item.status === row.status
      );
      scheduleIds = deptSchedules.map((item) => item.id_schedule);
    } else if (row.id_schedule) {
      scheduleIds = [row.id_schedule];
    }

    if (scheduleIds.length === 0) {
      this.statusModalLoading = false;
      return;
    }

    const calls = scheduleIds.map((id) =>
      this.scheduleService.getAssetsBySchedule(id).pipe(
        map((assets: any[]) => assets || []),
        catchError(() => of([]))
      )
    );

    const sub = forkJoin(calls).subscribe({
      next: (results: any[][]) => {
        this.statusModalItems = ([] as any[]).concat(...results);
        this.statusModalLoading = false;
      },
      error: (err: any) => {
        console.error('Gagal memuat detail aset', err);
        this.statusModalLoading = false;
      },
    });

    this.subscriptions.add(sub);
  }

  closeStatusModal() {
    this.isStatusModalOpen = false;
    this.statusModalItems = [];
    this.statusModalStartDate = null;
    this.statusModalEndDate = null;
    this.statusModalDurationDays = 0;
  }

  goToAssetDetail(kodeAsset: string) {
    if (!kodeAsset) return;
    this.router.navigate(['/inventory'], {
      queryParams: { asset: kodeAsset, tab: 'history' },
    });
  }

  // ===== DRAG TO SCROLL =====
  onGanttMouseDown(event: MouseEvent) {
    const el = this.ganttScrollRef?.nativeElement;
    if (!el) return;
    this.isDragging = true;
    el.classList.add('dragging');
    this.dragStartX = event.pageX - el.offsetLeft;
    this.dragScrollLeft = el.scrollLeft;
  }

  onGanttMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const el = this.ganttScrollRef?.nativeElement;
    if (!el) return;
    event.preventDefault();
    const x = event.pageX - el.offsetLeft;
    const walk = x - this.dragStartX;
    el.scrollLeft = this.dragScrollLeft - walk;
  }

  onGanttMouseUp() {
    this.isDragging = false;
    this.ganttScrollRef?.nativeElement?.classList.remove('dragging');
  }

  onPeriodChange() {
    this.hasInitialScrolled = false;
    this.buildChartData();
    this.scrollGanttToToday();
  }

  getMonthLabel(month: number): string {
    const m = this.monthOptions.find((item) => item.value === Number(month));
    return m ? m.label : '';
  }

  getPeriodLabel(): string {
    if (this.selectedPeriod === 'monthly') {
      return `${this.getMonthLabel(this.selectedMonth)} ${this.selectedYear}`;
    } else {
      return `Tahun ${this.selectedYear}`;
    }
  }

  // ===== FILTER =====
  filterDepartments(event: any) {
    this.searchTerm = event?.target?.value || '';
    this.onFilterChange();
  }

  onFilterChange() {
    let filtered = [...this.departments];
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (d) =>
          d.nama_departemen.toLowerCase().includes(q) ||
          d.schedules.some((s) => (s.nama_schedule || s.nama || '').toLowerCase().includes(q))
      );
    }
    if (this.filterDept) {
      filtered = filtered.filter(
        (d) => d.nama_departemen === this.filterDept || String(d.id_departemen) === String(this.filterDept)
      );
    }
    if (this.filterStatus) {
      const isActive = this.filterStatus === 'Aktif';
      filtered = filtered
        .map((dept) => ({
          ...dept,
          schedules: dept.schedules.filter((s) => s.is_active === isActive),
        }))
        .filter((dept) => dept.schedules.length > 0);
    }
    this.filteredDepartments = filtered;
    this.buildChartData();
  }

  // ===== NAVIGATION =====
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToListTicket() {
    this.router.navigate(['/list-ticket']);
  }

  goToApprovalTicket() {
    this.router.navigate(['/approval-ticket']);
  }

  goToAssignmentTicket() {
    this.router.navigate(['/assignment-ticket']);
  }

  goToKaryawan() {
    this.router.navigate(['/karyawan']);
  }

  goToUser() {
    this.router.navigate(['/user']);
  }

  goToJabatan() {
    this.router.navigate(['/jabatan']);
  }

  goToDepartemen() {
    this.router.navigate(['/departemen']);
  }

  goToBagianDepartemen() {
    this.router.navigate(['/bagian-departemen']);
  }

  goToTeknisi() {
    this.router.navigate(['/teknisi']);
  }

  goToInventory() {
    this.router.navigate(['/inventory']);
  }

  goToKategori() {
    this.router.navigate(['/kategori']);
  }

  goToSubKategori() {
    this.router.navigate(['/sub-kategori']);
  }

  goToLaporanFeedback() {
    this.router.navigate(['/laporan-feedback']);
  }

  goToStatistikTicket() {
    this.router.navigate(['/statistik-ticket']);
  }

  goToPengaturan() {
    this.router.navigate(['/pengaturan']);
  }

  viewDetail(dept: DepartmentSchedule) {
    this.selectedDepartment = dept;
    this.viewMode = 'detail';
  }

  backToList() {
    this.viewMode = 'list';
    this.selectedDepartment = null;
  }

  // ===== MODAL CRUD =====
  // 🔧 FIXED: checklist_kategori sekarang di-default isi SEMUA kategori
  // (bukan array kosong) supaya saat admin buat schedule baru, semua
  // checklist otomatis tercentang. Admin tinggal uncheck kalau memang
  // tidak perlu, daripada harus centang manual satu-satu.
  // 🔧 FIXED (BUG TANGGAL): tanggal_mulai default pakai todayDateStr()
  // (format 'YYYY-MM-DD' lokal). TIDAK ADA batas/clamp yang memaksa
  // tanggal_mulai harus hari ini — admin bebas pilih tanggal ke depan
  // lewat ion-datetime, lihat onTanggalMulaiChange() di bawah.
  openCreateModal(deptId?: number) {
    this.isEditing = false;
    this.formData = {
      id: null,
      nama: '',
      id_departemen: deptId || null,
      tanggal_mulai: todayDateStr(),
      tanggal_selesai: '',
      deskripsi: '',
      aset_list: [],
      checklist_kategori: [...this.checklistKategoriOptions], // ✅ default semua tercentang
      id_teknis: [],
      teknisi_list: '',
    };
    this.availableAssets = [];
    if (deptId) setTimeout(() => this.onDepartemenChange(), 300);
    this.isModalOpen = true;
  }

  // ============================================================
  // 🔧 FIXED (ROOT CAUSE BUG "tanggal mulai balik ke hari ini"):
  // Sebelumnya ion-datetime pakai [(ngModel)] di dalam ion-popover.
  // Popover Ionic di-render lewat overlay/portal TERPISAH dari tree
  // komponen utama, sehingga two-way binding ngModel sering GAGAL
  // commit balik ke formData saat user memilih tanggal — akibatnya
  // tampilan/nilai balik ke default awal (hari ini) begitu popover
  // ditutup atau change detection berikutnya jalan.
  //
  // FIX: ion-datetime sekarang pakai [value] (one-way, baca dari
  // formData) + (ionChange) yang secara EKSPLISIT menulis ke formData
  // lewat method ini (lihat schedule.page.html). Ini pola yang
  // direkomendasikan untuk ion-datetime di dalam ion-popover/overlay.
  //
  // Tidak ada validasi "tidak boleh sebelum hari ini" di sini — admin
  // bebas memilih tanggal berapa pun ke depan. Satu-satunya aturan:
  // kalau tanggal_selesai yang sudah dipilih jadi lebih awal dari
  // tanggal_mulai baru, tanggal_selesai direset (harus dipilih ulang).
  // ============================================================
  onTanggalMulaiChange(event: any) {
    const raw = event?.detail?.value ?? event;
    const val = toLocalDateStr(raw);
    if (!val) return;

    this.formData.tanggal_mulai = val;

    if (
      this.formData.tanggal_selesai &&
      new Date(this.formData.tanggal_selesai) < new Date(val)
    ) {
      this.formData.tanggal_selesai = '';
    }
  }

  // 🔥 BARU — pasangan onTanggalMulaiChange untuk field tanggal_selesai,
  // pakai pola [value]+(ionChange) yang sama (bukan ngModel).
  onTanggalSelesaiChange(event: any) {
    const raw = event?.detail?.value ?? event;
    const val = toLocalDateStr(raw);
    if (!val) return;
    this.formData.tanggal_selesai = val;
  }

  openEditModal(schedule: Schedule) {
    this.editSchedule(schedule);
  }

  // 🔥 GANTI: id_teknis diambil apa adanya (array string dari backend, mis. ["TKN-0009"]),
  // TIDAK dikonversi ke Number lagi (id_teknisi memang berformat string).
  // 🔧 FIXED: tanggal_mulai & tanggal_selesai dinormalisasi lewat
  // toLocalDateStr() supaya formatnya konsisten 'YYYY-MM-DD' saat masuk
  // ke ion-datetime (mencegah masalah timezone/parse yang sama seperti
  // bug tanggal_mulai balik ke hari ini).
  editSchedule(schedule: Schedule) {
    this.isEditing = true;
    const sId = schedule.id_schedule!;
    const sched = schedule as any;

    let checklistKategori: string[] = [];
    try {
      checklistKategori = sched.checklist_kategori ? JSON.parse(sched.checklist_kategori) : [];
      if (!Array.isArray(checklistKategori)) checklistKategori = [];
    } catch {
      checklistKategori = [];
    }

    this.formData = {
      id: sId,
      nama: schedule.nama_schedule || schedule.nama || '',
      id_departemen: schedule.id_departemen,
      tanggal_mulai: toLocalDateStr(sched.tanggal_mulai),
      tanggal_selesai: toLocalDateStr(sched.tanggal_selesai),
      deskripsi: schedule.deskripsi || '',
      aset_list: [],
      checklist_kategori: checklistKategori,
      id_teknis: Array.isArray(sched.id_teknis) ? sched.id_teknis : [],
      teknisi_list: sched.teknisi_list || '',
    };

    setTimeout(() => {
      this.onDepartemenChange();
    }, 200);

    const sub = this.scheduleService.getAssetsBySchedule(sId).subscribe({
      next: (data: any[]) => {
        this.formData.aset_list = (data || []).map((a: any) => a.kode_asset || a.id_asset);
      },
      error: (err: any) => console.error('Gagal load aset', err),
    });

    this.subscriptions.add(sub);
    this.isModalOpen = true;
  }

  loadDropdownOptions() {
    const subDept = this.departemenService.getAll().subscribe((data: any) => {
      this.departemenOptions = Array.isArray(data) ? data : data?.data || [];
    });

    const subInv = this.inventoryService.getAll().subscribe({
      next: (data: any) => {
        this.allAssets = Array.isArray(data) ? data : data?.data || [];
        if (this.formData.id_departemen) this.onDepartemenChange();
      },
      error: (err: any) => {
        console.error('Gagal load inventory:', err);
        this.allAssets = [];
        this.availableAssets = [];
      },
    });

    this.subscriptions.add(subDept);
    this.subscriptions.add(subInv);
  }

  onDepartemenChange() {
    const selectedDeptId = this.formData.id_departemen;
    if (selectedDeptId) {
      const selectedDept = this.departemenOptions.find(
        (d: any) => Number(d.id_departemen || d.id) === Number(selectedDeptId)
      );
      const deptName = selectedDept?.nama_departemen || selectedDept?.nama || '';

      this.availableAssets = this.allAssets.filter((asset: any) => {
        const assetDeptId = asset.id_departemen ?? asset.departemen_id ?? asset.idDept;
        const assetDeptName = asset.dept ?? asset.departemen ?? asset.nama_departemen;
        const matchById = Number(assetDeptId) === Number(selectedDeptId);
        const matchByName = deptName && assetDeptName && assetDeptName.toLowerCase() === deptName.toLowerCase();
        return matchById || matchByName;
      });

      if (this.availableAssets.length === 0 && deptName) {
        this.availableAssets = this.allAssets.filter((asset: any) => {
          const assetDeptName = asset.dept ?? asset.departemen ?? asset.nama_departemen;
          return assetDeptName && assetDeptName.toLowerCase() === deptName.toLowerCase();
        });
      }

      if (!this.isEditing) {
        this.formData.aset_list = this.availableAssets.map((a: any) => a.kode_asset || a.id);
      }
    } else {
      this.availableAssets = [];
      if (!this.isEditing) this.formData.aset_list = [];
    }
  }

  // 🔧 FIXED: dipanggil dari checkbox di template. Menambah/menghapus kategori
  // dari formData.checklist_kategori sesuai status checked pada ion-checkbox.
  onChecklistKategoriToggle(kategori: string, event: any) {
    if (!this.formData.checklist_kategori) this.formData.checklist_kategori = [];
    const checked = event?.detail?.checked;
    if (checked) {
      if (!this.formData.checklist_kategori.includes(kategori)) {
        this.formData.checklist_kategori.push(kategori);
      }
    } else {
      this.formData.checklist_kategori = this.formData.checklist_kategori.filter((k: string) => k !== kategori);
    }
  }

  // 🔧 BARU — helper untuk menentukan status checked sebuah kategori di template
  isChecklistKategoriSelected(kategori: string): boolean {
    return Array.isArray(this.formData.checklist_kategori) && this.formData.checklist_kategori.includes(kategori);
  }

  // 🔧 BARU — toggle pilih semua / kosongkan semua kategori checklist sekaligus
  toggleAllChecklistKategori(checked: boolean) {
    this.formData.checklist_kategori = checked ? [...this.checklistKategoriOptions] : [];
  }

  get isAllChecklistKategoriSelected(): boolean {
    return (
      Array.isArray(this.formData.checklist_kategori) &&
      this.checklistKategoriOptions.length > 0 &&
      this.checklistKategoriOptions.every((k) => this.formData.checklist_kategori.includes(k))
    );
  }

  // 🔥 GANTI: payload TIDAK PERNAH mengirim id_teknis lagi dari sini.
  // Assignment teknisi sekarang HANYA lewat klaim teknisi sendiri
  // (claim) atau batal klaim Admin (unclaim/batalkanKlaim).
  // 🔧 FIXED: tanggal_mulai/tanggal_selesai dinormalisasi lewat
  // toLocalDateStr() sebelum dikirim ke backend — memastikan format
  // selalu 'YYYY-MM-DD' apa pun sumber nilainya (hasil ionChange yang
  // sudah date-only, ATAU nilai lama yang mungkin masih ISO timestamp).
  saveSchedule() {
    if (!this.formData.nama || !this.formData.id_departemen || !this.formData.tanggal_mulai || !this.formData.tanggal_selesai) {
      alert('Nama, Departemen, Tanggal Mulai, dan Tanggal Selesai wajib diisi!');
      return;
    }

    const tglMulai = toLocalDateStr(this.formData.tanggal_mulai);
    const tglSelesai = toLocalDateStr(this.formData.tanggal_selesai);

    if (new Date(tglSelesai) < new Date(tglMulai)) {
      alert('Tanggal Selesai tidak boleh lebih awal dari Tanggal Mulai!');
      return;
    }

    // 🔧 FIXED: checklist_kategori TIDAK lagi bergantung pada pilihan admin.
    // Semua kategori (this.checklistKategoriOptions) otomatis dikirim ke
    // backend setiap kali Simpan diklik, sehingga Check Sheet tiket hasil
    // auto-create selalu terisi lengkap tanpa perlu interaksi apa pun dari admin.
    const payload = {
      nama_schedule: this.formData.nama,
      id_departemen: this.formData.id_departemen,
      tanggal_mulai: tglMulai,
      tanggal_selesai: tglSelesai,
      deskripsi: this.formData.deskripsi,
      aset_list: this.formData.aset_list,
      checklist_kategori: [...this.checklistKategoriOptions],
    };

    if (this.isEditing) {
      const updateId = this.formData.id;
      if (!updateId) {
        alert('ID schedule tidak ditemukan!');
        return;
      }
      this.scheduleService.update(updateId, payload).subscribe({
        next: () => {
          this.isModalOpen = false;
          this.loadData();
          alert('Schedule berhasil diupdate!');
        },
        error: (err: any) => {
          console.error('Gagal update:', err);
          alert('Gagal update schedule: ' + (err?.error?.message || 'Terjadi kesalahan'));
        },
      });
    } else {
      this.scheduleService.create(payload).subscribe({
        next: () => {
          this.isModalOpen = false;
          this.loadData();
          alert('Schedule berhasil dibuat! Menunggu diklaim teknisi.');
        },
        error: (err: any) => {
          console.error('Gagal tambah:', err);
          alert('Gagal menambah schedule: ' + (err?.error?.message || 'Terjadi kesalahan'));
        },
      });
    }
  }

  simpanSchedule() {
    this.saveSchedule();
  }

  // 🔥 BARU — batalkan klaim teknisi lewat endpoint dedicated (bukan update biasa,
  // karena updateSchedule pakai COALESCE yang tidak bisa mengosongkan nilai)
  batalkanKlaim() {
    const sId = this.formData.id;
    if (!sId) return;
    if (!confirm('Batalkan klaim teknisi dari schedule ini?')) return;

    this.scheduleService.unclaim(sId).subscribe({
      next: () => {
        this.formData.id_teknis = [];
        this.formData.teknisi_list = '';
        alert('Klaim dibatalkan. Schedule kembali tersedia untuk teknisi lain.');
        this.loadData();
      },
      error: (err: any) => alert(err?.error?.message || 'Gagal membatalkan klaim'),
    });
  }

  closeModal() {
    this.isModalOpen = false;
  }

  toggleSchedule(schedule: Schedule) {
    const sId = schedule.id_schedule!;
    const newStatus = !schedule.is_active;
    this.scheduleService.update(sId, { is_active: newStatus }).subscribe({
      next: () => {
        schedule.is_active = newStatus;
        if (this.selectedDepartment) {
          this.selectedDepartment.total_aktif = this.selectedDepartment.schedules.filter((s) => s.is_active).length;
        } else {
          this.loadData();
        }
      },
      error: (err: any) => {
        console.error('Gagal mengubah status schedule', err);
        alert('Gagal mengubah status schedule');
      },
    });
  }

  // ============================================================
  // HAPUS SCHEDULE — dipakai dari view detail (tombol "Hapus" di kartu)
  // maupun dari tabel Rekapan di halaman list utama (hapusFromRekapan).
  // Backend (scheduleController.js deleteSchedule) sudah dibuat ikut
  // menghapus seluruh tiket/assignment/checklist terkait schedule ini,
  // bukan cuma baris preventive_schedule-nya saja.
  // ============================================================
  deleteSchedule(schedule: Schedule) {
    const sId = schedule.id_schedule!;
    if (confirm(`Apakah Anda yakin ingin menghapus schedule "${schedule.nama_schedule}"?\nSemua tiket preventive yang sudah dibuat dari schedule ini ikut terhapus.`)) {
      this.scheduleService.delete(sId).subscribe({
        next: () => {
          this.loadData();
          if (this.selectedDepartment) {
            this.selectedDepartment.schedules = this.selectedDepartment.schedules.filter(
              (s) => s.id_schedule !== sId
            );
            this.selectedDepartment.total_aktif = this.selectedDepartment.schedules.filter(
              (s) => s.is_active
            ).length;
          }
        },
        error: (err: any) => {
          console.error('Gagal menghapus schedule', err);
          alert(err?.error?.message || 'Gagal menghapus schedule');
        },
      });
    }
  }

  // ===== MODAL ASET =====
  openAssetModal(schedule: Schedule) {
    this.assetModalScheduleId = schedule.id_schedule!;
    this.assetModalScheduleName = schedule.nama_schedule || '';
    this.isAssetModalOpen = true;

    const sub = this.scheduleService.getAssetsBySchedule(this.assetModalScheduleId).subscribe({
      next: (data: any[]) => {
        this.assetList = data || [];
        this.filteredAssetList = data || [];
        this.assetCurrentPage = 1;
      },
      error: (err: any) => {
        console.error('Gagal memuat aset terkait', err);
        this.assetList = [];
        this.filteredAssetList = [];
      },
    });

    this.subscriptions.add(sub);
  }

  closeAssetModal() {
    this.isAssetModalOpen = false;
    this.assetModalScheduleId = null;
    this.assetModalScheduleName = '';
  }

  filterAssets(event: any) {
    const query = event?.target?.value?.toLowerCase().trim() || '';
    this.assetSearchQuery = query;
    if (!query) {
      this.filteredAssetList = [...this.assetList];
    } else {
      this.filteredAssetList = this.assetList.filter(
        (asset) =>
          (asset.kode_asset && asset.kode_asset.toLowerCase().includes(query)) ||
          (asset.nama_asset && asset.nama_asset.toLowerCase().includes(query)) ||
          (asset.no_seri && asset.no_seri.toLowerCase().includes(query))
      );
    }
    this.assetCurrentPage = 1;
  }

  approveByAdmin(asset: any) {
    if (!asset.id_ticket) return;
    this.ticketService.approveChecklistByItService(asset.id_ticket, 'Approve').subscribe({
      next: () => {
        alert('Berhasil approve. Aset ini sekarang bisa didownload PDF-nya.');
        asset.admin_konfirmasi = 1;
      },
      error: (err: any) => alert(err?.error?.message || 'Gagal approve')
    });
  }

  rejectByAdmin(asset: any, catatan?: string) {
    if (!asset.id_ticket) return;
    this.ticketService.approveChecklistByItService(asset.id_ticket, 'Reject', catatan).subscribe({
      next: () => {
        alert('Checklist ditolak.');
        asset.admin_konfirmasi = 0;
      },
      error: (err: any) => alert(err?.error?.message || 'Gagal reject')
    });
  }

  downloadPdf(asset: any) {
    if (!asset.id_ticket) return;
    this.ticketService.downloadChecklistPdf(asset.id_ticket);
  }
}