import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
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
  IonText
} from '@ionic/angular/standalone';
import { ScheduleService, DepartmentSchedule, Schedule } from '../../services/schedule.service';
import { DepartemenService } from '../../services/departemen.services';
import { KategoriService } from '../../services/kategori.service';
import { SubKategoriService } from '../../services/sub-kategori.service';
import { TeknisiService } from '../../services/teknisi.service';
import { InventoryService } from '../../services/inventory.service';

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
    IonText
  ],
})
export class SchedulePage implements OnInit {
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

  // ===== DATA =====
  departments: DepartmentSchedule[] = [];
  filteredDepartments: DepartmentSchedule[] = [];
  selectedDepartment: DepartmentSchedule | null = null;

  // ===== DROPDOWN OPTIONS =====
  satuanOptions: ('hari' | 'minggu' | 'bulan' | 'tahun')[] = ['hari', 'minggu', 'bulan', 'tahun'];
  departemenOptions: any[] = [];
  kategoriOptions: any[] = [];
  subKategoriOptions: any[] = [];
  allSubKategori: any[] = [];
  teknisiOptions: any[] = [];
  allAssets: any[] = [];
  availableAssets: any[] = [];

  // ===== MODAL CRUD =====
  isModalOpen = false;
  isEditing = false;
  formData: any = {
    id: null,
    nama: '',
    id_departemen: null,
    id_kategori: null,
    id_sub_kategori: null,
    frekuensi: 1,
    satuan: 'bulan',
    id_teknisi_utama: null,
    id_teknisi_pendamping: null,
    deskripsi: '',
    aset_list: [],
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

  // ===== BAR CHART PER DEPARTEMEN =====
  deptChartData: { departemen: string; belum: number; proses: number; selesai: number }[] = [];

  // ===== REKAPAN DATA (dari database) =====
  rekapanData: any[] = [];

  // ===== MODAL DETAIL STATUS =====
  isStatusModalOpen = false;
  statusModalTitle = '';
  statusModalItems: any[] = [];
  statusModalLoading = false;

  constructor(
    private router: Router,
    private scheduleService: ScheduleService,
    private departemenService: DepartemenService,
    private kategoriService: KategoriService,
    private subKategoriService: SubKategoriService,
    private teknisiService: TeknisiService,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    this.loadData();
    this.loadDropdownOptions();
  }

  // ===== LOAD DATA =====
  loadData() {
    this.isLoading = true;
    this.scheduleService.getDepartmentsWithSchedules().subscribe({
      next: (data) => {
        this.departments = data || [];
        this.filteredDepartments = data || [];
        this.isLoading = false;
        this.onFilterChange();
      },
      error: (err: any) => {
        console.error('Gagal load departments', err);
        this.errorMessage = 'Gagal memuat data.';
        this.isLoading = false;
      },
    });
  }

  // ===== 🔥 BUILD CHART & REKAPAN (pakai field asli dari backend) =====
  buildChartData() {
    if (!this.filteredDepartments || this.filteredDepartments.length === 0) {
      this.chartData = [];
      this.totalPcPreventive = 0;
      this.deptChartData = [];
      this.rekapanData = [];
      return;
    }

    const allItems: any[] = [];
    const rekapanItems: any[] = [];
    let totalAsset = 0;

    for (const dept of this.filteredDepartments) {
      if (!dept.schedules) continue;

      for (const sched of dept.schedules) {
        if (!sched.is_active) continue;

        const s = sched as any;
        const totalAset = sched.total_aset || 0;
        totalAsset += totalAset;

        // 🔥 field asli dari backend: completed_aset, max_progress, status_pengerjaan
        const selesaiCount = Math.min(s.completed_aset ?? 0, totalAset);
        const maxProgress = s.max_progress ?? 0;
        const statusPengerjaan = s.status_pengerjaan;

        let prosesCount = 0;
        if (selesaiCount < totalAset && (maxProgress > 0 || statusPengerjaan)) {
          // ada indikasi pekerjaan sudah dimulai (ada tiket/assignment berjalan)
          prosesCount = totalAset - selesaiCount;
        }

        const belumCount = Math.max(0, totalAset - selesaiCount - prosesCount);

        let status = 'plan';
        if (selesaiCount === totalAset && totalAset > 0) {
          status = 'approve';
        } else if (prosesCount > 0) {
          status = 'progress';
        }

        // Data chart
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

        // REKAPAN DATA (dari database)
        const startDate = sched.created_at ? new Date(sched.created_at) : new Date();
        let durationDays = sched.frekuensi || 1;
        if (sched.satuan === 'minggu') durationDays *= 7;
        else if (sched.satuan === 'bulan') durationDays *= 30;
        else if (sched.satuan === 'tahun') durationDays *= 365;
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + durationDays);

        // Ambil nama teknisi dari database (teknisi_list)
        let teknisi = sched.teknisi_list || 'Belum ditentukan';
        if (Array.isArray(teknisi)) {
          teknisi = teknisi.join(', ');
        }

        rekapanItems.push({
          departemen: dept.nama_departemen,
          schedule: sched.nama_schedule || sched.nama || '-',
          totalAset,
          durationDays,
          startDate,
          endDate,
          teknisi: teknisi,
        });
      }
    }

    this.totalPcPreventive = totalAsset;
    this.chartData = allItems;
    this.rekapanData = rekapanItems;

    this.buildDeptChart();
  }

  buildDeptChart() {
    const deptMap: { [dept: string]: { belum: number; proses: number; selesai: number } } = {};
    for (const item of this.chartData) {
      if (!deptMap[item.departemen]) {
        deptMap[item.departemen] = { belum: 0, proses: 0, selesai: 0 };
      }
      deptMap[item.departemen].belum += item.belum_count;
      deptMap[item.departemen].proses += item.proses_count;
      deptMap[item.departemen].selesai += item.selesai_count;
    }
    this.deptChartData = Object.keys(deptMap).map((dept) => ({
      departemen: dept,
      belum: deptMap[dept].belum,
      proses: deptMap[dept].proses,
      selesai: deptMap[dept].selesai,
    }));
  }

  getMaxBarValue(): number {
    let max = 0;
    for (const d of this.deptChartData) {
      max = Math.max(max, d.belum, d.proses, d.selesai);
    }
    return max || 1;
  }

  getBarHeightPercent(value: number): number {
    return (value / this.getMaxBarValue()) * 100;
  }

  openStatusDetail(departemen: string, statusKey: 'belum' | 'proses' | 'selesai') {
    const labelMap: any = {
      belum: 'Belum Dikerjakan',
      proses: 'In Progress',
      selesai: 'Selesai',
    };
    this.statusModalTitle = `${departemen} - ${labelMap[statusKey]}`;
    this.statusModalItems = [];
    this.statusModalLoading = true;
    this.isStatusModalOpen = true;

    const matchStatuses =
      statusKey === 'belum' ? ['plan'] :
      statusKey === 'proses' ? ['progress'] :
      ['approve', 'complete'];

    const matchingSchedules = this.chartData.filter(
      (item) => item.departemen === departemen && matchStatuses.includes(item.status)
    );

    if (matchingSchedules.length === 0) {
      this.statusModalLoading = false;
      return;
    }

    const calls = matchingSchedules.map((sched) =>
      this.scheduleService.getAssetsBySchedule(sched.id_schedule).pipe(
        map((assets: any[]) =>
          (assets || []).map((a) => ({
            ...a,
            nama_schedule: sched.nama_schedule,
          }))
        )
      )
    );

    forkJoin(calls).subscribe({
      next: (results: any[][]) => {
        this.statusModalItems = ([] as any[]).concat(...results);
        this.statusModalLoading = false;
      },
      error: (err) => {
        console.error('Gagal memuat detail aset', err);
        this.statusModalLoading = false;
      },
    });
  }

  closeStatusModal() {
    this.isStatusModalOpen = false;
    this.statusModalItems = [];
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
      filtered = filtered.filter((d) =>
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

  // ===== NAVIGATION & UI =====
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
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
  openCreateModal(deptId?: number) {
    this.isEditing = false;
    this.formData = {
      id: null,
      nama: '',
      id_departemen: deptId || null,
      id_kategori: null,
      id_sub_kategori: null,
      frekuensi: 1,
      satuan: 'bulan',
      id_teknisi_utama: null,
      id_teknisi_pendamping: null,
      deskripsi: '',
      aset_list: [],
    };
    this.subKategoriOptions = [];
    this.availableAssets = [];

    if (deptId) {
      setTimeout(() => {
        this.onDepartemenChange();
      }, 300);
    }

    this.isModalOpen = true;
  }

  openEditModal(schedule: Schedule) {
    this.editSchedule(schedule);
  }

  editSchedule(schedule: Schedule) {
    this.isEditing = true;
    const sId = schedule.id_schedule!;
    const sched = schedule as any;

    const mainTeknisi = schedule.id_teknisi_utama ?? (Array.isArray(sched.id_teknis) ? sched.id_teknis[0] : null);
    const pendampingTeknisi = schedule.id_teknisi_pendamping ?? (Array.isArray(sched.id_teknis) ? sched.id_teknis[1] : null);

    this.formData = {
      id: sId,
      nama: schedule.nama_schedule || schedule.nama || '',
      id_departemen: schedule.id_departemen,
      id_kategori: schedule.id_kategori,
      id_sub_kategori: schedule.id_sub_kategori,
      frekuensi: schedule.frekuensi,
      satuan: schedule.satuan || 'bulan',
      id_teknisi_utama: mainTeknisi,
      id_teknisi_pendamping: pendampingTeknisi,
      deskripsi: schedule.deskripsi || '',
      aset_list: [],
    };

    setTimeout(() => {
      this.onKategoriChange();
      this.onDepartemenChange();
    }, 200);

    this.scheduleService.getAssetsBySchedule(sId).subscribe({
      next: (data: any[]) => {
        this.formData.aset_list = (data || []).map((a: any) => a.kode_asset || a.id_asset);
      },
      error: (err: any) => console.error('Gagal load aset', err),
    });

    this.isModalOpen = true;
  }

  loadDropdownOptions() {
    this.departemenService.getAll().subscribe((data: any) => {
      this.departemenOptions = Array.isArray(data) ? data : data?.data || [];
    });

    this.kategoriService.getAll().subscribe((data: any) => {
      this.kategoriOptions = Array.isArray(data) ? data : data?.data || [];
    });

    this.subKategoriService.getAll().subscribe((data: any) => {
      this.allSubKategori = Array.isArray(data) ? data : data?.data || [];
    });

    this.teknisiService.getAll().subscribe((data: any) => {
      this.teknisiOptions = Array.isArray(data) ? data : data?.data || [];
    });

    this.inventoryService.getAll().subscribe({
      next: (data: any) => {
        this.allAssets = Array.isArray(data) ? data : data?.data || [];
        if (this.formData.id_departemen) {
          this.onDepartemenChange();
        }
      },
      error: (err) => {
        console.error('❌ Gagal load inventory:', err);
        this.allAssets = [];
        this.availableAssets = [];
      },
    });
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
    } else {
      this.availableAssets = [];
    }

    if (!this.isEditing) {
      this.formData.aset_list = [];
    }
  }

  onKategoriChange() {
    const selectedKatId = this.formData.id_kategori;
    if (!this.isEditing) {
      this.formData.id_sub_kategori = null;
    }

    if (selectedKatId) {
      this.subKategoriOptions = this.allSubKategori.filter((sk: any) => {
        const katId = sk.idKategori ?? sk.id_kategori ?? sk.kategori_id ?? sk.id_master_kategori;
        return katId !== undefined && katId !== null && Number(katId) === Number(selectedKatId);
      });
    } else {
      this.subKategoriOptions = [];
    }
  }

  saveSchedule() {
    if (!this.formData.nama || !this.formData.id_departemen || !this.formData.frekuensi) {
      alert('Nama, Departemen, dan Frekuensi wajib diisi!');
      return;
    }

    const teknisiList: number[] = [];
    if (this.formData.id_teknisi_utama) teknisiList.push(this.formData.id_teknisi_utama);
    if (this.formData.id_teknisi_pendamping) teknisiList.push(this.formData.id_teknisi_pendamping);

    const payload = {
      nama_schedule: this.formData.nama,
      id_departemen: this.formData.id_departemen,
      id_kategori: this.formData.id_kategori,
      id_sub_kategori: this.formData.id_sub_kategori,
      frekuensi: this.formData.frekuensi,
      satuan: this.formData.satuan,
      id_teknis: teknisiList,
      deskripsi: this.formData.deskripsi,
      aset_list: this.formData.aset_list,
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
          console.error('❌ Gagal update:', err);
          alert('Gagal update schedule: ' + (err?.error?.message || 'Terjadi kesalahan'));
        },
      });
    } else {
      this.scheduleService.create(payload).subscribe({
        next: () => {
          this.isModalOpen = false;
          this.loadData();
          alert('Schedule berhasil dibuat!');
        },
        error: (err: any) => {
          console.error('❌ Gagal tambah:', err);
          alert('Gagal menambah schedule: ' + (err?.error?.message || 'Terjadi kesalahan'));
        },
      });
    }
  }

  simpanSchedule() {
    this.saveSchedule();
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

  deleteSchedule(schedule: Schedule) {
    const sId = schedule.id_schedule!;
    if (confirm(`Apakah Anda yakin ingin menghapus schedule "${schedule.nama_schedule}"?`)) {
      this.scheduleService.delete(sId).subscribe({
        next: () => {
          this.loadData();
          if (this.selectedDepartment) {
            this.selectedDepartment.schedules = this.selectedDepartment.schedules.filter(
              (s) => s.id_schedule !== sId
            );
            this.selectedDepartment.total_aktif = this.selectedDepartment.schedules.filter((s) => s.is_active).length;
          }
        },
        error: (err: any) => {
          console.error('Gagal menghapus schedule', err);
          alert('Gagal menghapus schedule');
        },
      });
    }
  }

  // ===== MODAL ASET =====
  openAssetModal(schedule: Schedule) {
    this.assetModalScheduleId = schedule.id_schedule!;
    this.assetModalScheduleName = schedule.nama_schedule || '';
    this.isAssetModalOpen = true;

    this.scheduleService.getAssetsBySchedule(this.assetModalScheduleId).subscribe({
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
          asset.kode_asset?.toLowerCase().includes(query) ||
          asset.nama_barang?.toLowerCase().includes(query) ||
          asset.merk_model?.toLowerCase().includes(query)
      );
    }
    this.assetCurrentPage = 1;
  }

  get assetTotalPages(): number {
    return Math.ceil(this.filteredAssetList.length / this.assetPageSize) || 1;
  }

  get pagedAssetList(): any[] {
    const start = (this.assetCurrentPage - 1) * this.assetPageSize;
    return this.filteredAssetList.slice(start, start + this.assetPageSize);
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

  // ===== HELPER METHODS =====
  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
  }

  getStatusColor(schedule: Schedule): string {
    return schedule.is_active ? 'success' : 'medium';
  }

  getStatusBadge(schedule: Schedule): string {
    return schedule.is_active ? 'Aktif' : 'Nonaktif';
  }

  // ===== 🔥 FIX: pakai completed_aset asli dari backend =====
  getProgress(schedule: Schedule): number {
    const s = schedule as any;
    const totalAset = schedule.total_aset || 1;
    const completedAset = Math.min(s.completed_aset ?? 0, totalAset);
    return Math.round((completedAset / totalAset) * 100);
  }

  // ===== ROUTING NAVIGATION =====
  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToListTicket() { this.router.navigate(['/list-ticket']); }
  goToApprovalTicket() { this.router.navigate(['/approval-ticket']); }
  goToAssignmentTicket() { this.router.navigate(['/assignment-ticket']); }
  goToKaryawan() { this.router.navigate(['/karyawan']); }
  goToUser() { this.router.navigate(['/user']); }
  goToJabatan() { this.router.navigate(['/jabatan']); }
  goToDepartemen() { this.router.navigate(['/departemen']); }
  goToBagianDepartemen() { this.router.navigate(['/bagian-departemen']); }
  goToTeknisi() { this.router.navigate(['/teknisi']); }
  goToInventory() { this.router.navigate(['/inventory']); }
  goToKategori() { this.router.navigate(['/kategori']); }
  goToSubKategori() { this.router.navigate(['/sub-kategori']); }
  goToLaporanFeedback() { this.router.navigate(['/laporan-feedback']); }
  goToStatistikTicket() { this.router.navigate(['/statistik-ticket']); }
  goToPengaturan() { this.router.navigate(['/pengaturan']); }
}