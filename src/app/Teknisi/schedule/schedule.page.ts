import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ScheduleService, DepartmentSchedule, Schedule } from '../../services/schedule.service';
import { TeknisiService } from '../../services/teknisi.service';
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
  isClaimed: boolean;
}

// 🔥 BARU — hasil parse teknisi_klaim: siapa ngerjain berapa aset
export interface TeknisiKlaimItem {
  nama: string;
  jumlah: number;
}

@Component({
  selector: 'app-schedule-tersedia',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ScheduleTersediaPage implements OnInit, OnDestroy {
  isSidebarOpen = false;
  activeMenu = 'schedule-tersedia';
  isLoading = false;
  errorMessage = '';

  user = { nama: 'Teknisi', role: 'teknisi' };

  claimingId: number | null = null;

  searchTerm = '';
  filterDept = '';
  filterStatus = '';

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

  departments: DepartmentSchedule[] = [];
  filteredDepartments: DepartmentSchedule[] = [];
  teknisiOptions: any[] = [];

  chartData: any[] = [];
  totalPcPreventive = 0;
  rekapanData: any[] = [];
  rekapanFilterDept = '';

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

  // ===== MODAL DETAIL STATUS (klik bar gantt) =====
  isStatusModalOpen = false;
  statusModalTitle = '';
  statusModalItems: any[] = [];
  statusModalLoading = false;
  statusModalStartDate: Date | null = null;
  statusModalEndDate: Date | null = null;
  statusModalDurationDays = 0;
  statusModalScheduleId: number | null = null; // 🔥 BARU — dipakai claimAsset()

  private refreshInterval: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private scheduleService: ScheduleService,
    private teknisiService: TeknisiService
  ) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'Teknisi';
        this.user.role = parsed.role || 'teknisi';
      } catch (e) {}
    }

    const currentYear = new Date().getFullYear();
    this.yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

    this.loadData();

    this.refreshInterval = setInterval(() => {
      this.loadData(true);
    }, 10000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.subscriptions.unsubscribe();
  }

  loadData(isBackgroundRefresh = false) {
    if (!isBackgroundRefresh) {
      this.isLoading = true;
    }
    this.errorMessage = '';

    const sub = forkJoin({
      departments: this.scheduleService.getDepartmentsWithSchedules().pipe(catchError(() => of([]))),
      teknisi: this.teknisiService.getAll().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res: any) => {
        const rawTeknisi = res.teknisi;
        this.teknisiOptions = Array.isArray(rawTeknisi) ? rawTeknisi : rawTeknisi?.data || [];

        this.departments = res.departments || [];
        this.filteredDepartments = res.departments || [];

        this.isLoading = false;
        this.onFilterChange();

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

  doRefresh() {
    this.loadData();
  }

  get departemenOptions(): string[] {
    const names = this.departments.map((d) => d.nama_departemen).filter((n) => !!n);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }

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

  // ============================================================
  // 🔧 FIXED: sekarang cuma baca field `status` yang SUDAH dihitung
  // backend (attachStatus() di scheduleController.js) berdasarkan
  // jumlah aset yang benar-benar sudah dikerjakan/selesai — bukan
  // menebak-nebak dari 1 record ticket terakhir atau dari tanggal.
  // Default 'plan' (abu-abu) kalau field status tidak ada/tidak valid.
  // ============================================================
  private determineStatus(sched: any): 'plan' | 'progress' | 'approve' | 'userapprove' {
    const s = (sched.status || '').toString().toLowerCase().trim();
    if (s === 'plan' || s === 'progress' || s === 'approve' || s === 'userapprove') {
      return s as 'plan' | 'progress' | 'approve' | 'userapprove';
    }
    return 'plan';
  }

  // ============================================================
  // 🔥 BARU — parse field teknisi_klaim dari backend, format:
  // "Bagas:1||Putra:1" -> [{ nama: 'Bagas', jumlah: 1 }, { nama: 'Putra', jumlah: 1 }]
  // Ini data klaim per-asset yang SEBENARNYA (dari schedule_asset_claim),
  // beda dari teknisi_list (assign manual lama yang cuma gabungan nama).
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

        const selesaiCount = s.completed_aset ?? (status === 'approve' || status === 'userapprove' ? totalAset : 0);
        const prosesCount = status === 'progress' ? Math.max(1, (s.started_aset ?? totalAset) - selesaiCount) : 0;
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

        // 🔥 PRIORITAS 1: data klaim per-asset asli (schedule_asset_claim),
        // menunjukkan siapa ngerjain berapa aset di schedule ini.
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
            s.teknisi_detail,
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

        const isClaimed = teknisiKlaim.length > 0 || teknisiNames.length > 0;
        const teknisi = teknisiNames.length > 0 ? teknisiNames.join(', ') : 'Belum diklaim';

        const rekItem = {
          id_schedule: sched.id_schedule,
          departemen: dept.nama_departemen,
          schedule: sched.nama_schedule || sched.nama || '-',
          totalAset,
          durationDays,
          startDate,
          endDate,
          teknisi,
          teknisiKlaim, // 🔥 BARU — dipakai HTML untuk render per-teknisi
          isClaimed,
        };

        rekapanItems.push(rekItem);
        ganttSource.push({
          ...rekItem,
          status,
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
        isClaimed: item.isClaimed,
      });
    }

    this.ganttRows = rows;
  }

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
    this.statusModalScheduleId = row.id_schedule || null; // 🔥 BARU

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
    this.statusModalScheduleId = null; // 🔥 BARU
  }

  // 🔥 BARU — klaim 1 asset dari modal detail, lalu auto-navigate ke Proses Tiket
  claimAsset(asset: any) {
    if (!this.statusModalScheduleId) return;
    if (!confirm(`Ambil asset "${asset.nama_barang}" untuk dikerjakan?`)) return;

    this.scheduleService.claimAsset(this.statusModalScheduleId, asset.kode_asset).subscribe({
      next: (res: any) => {
        this.closeStatusModal();
        this.router.navigate(['/teknisi/proses'], {
          queryParams: { openTicket: res.id_ticket }
        });
      },
      error: (err: any) => {
        alert(err?.error?.message || 'Gagal mengklaim asset.');
      }
    });
  }

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
      filtered = filtered.filter((d) => d.nama_departemen === this.filterDept);
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

  ambilTugas(item: { id_schedule?: number; schedule?: string; departemen?: string; label?: string }) {
    const scheduleId = item.id_schedule;
    if (!scheduleId) return;

    const namaTugas = item.schedule || item.label || 'schedule ini';
    if (!confirm(`Ambil tugas "${namaTugas}" (${item.departemen || ''})?`)) return;

    this.claimingId = scheduleId;
    this.scheduleService.claim(scheduleId).subscribe({
      next: () => {
        this.claimingId = null;
        alert('Berhasil diklaim! Tugas sudah masuk ke halaman "Ticket Saya".');
        this.loadData();
      },
      error: (err: any) => {
        this.claimingId = null;
        if (err?.status === 409) {
          alert(err?.error?.message || 'Schedule ini baru saja diklaim teknisi lain.');
          this.loadData();
        } else {
          alert(err?.error?.message || 'Gagal mengklaim schedule.');
        }
      },
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }

  goToDashboardTeknisi() {
    this.setActiveMenu('dashboard-teknisi');
    this.router.navigate(['/teknisi/dashboard']);
  }
  goToTicket() {
    this.setActiveMenu('ticket');
    this.router.navigate(['/teknisi/ticket']);
  }
  goToProsesTiket() {
    this.setActiveMenu('proses-tiket');
    this.router.navigate(['/teknisi/proses']);
  }
  goToRiwayatTiket() {
    this.setActiveMenu('riwayat-tiket');
    this.router.navigate(['/teknisi/riwayat']);
  }
  goToScheduleTersedia() {
    this.setActiveMenu('schedule-tersedia');
    this.router.navigate(['/teknisi/schedule-tersedia']);
  }
  goToPengaturan() {
    this.setActiveMenu('pengaturan');
  }
  goToProfile() {
    this.setActiveMenu('profile');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}