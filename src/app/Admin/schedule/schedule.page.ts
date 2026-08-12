import { Component, OnInit } from '@angular/core';
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
    IonText,
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

  // ===== BAGAN / GANTT CHART =====
  chartData: any[] = [];
  chartMonths: string[] = [];
  totalPcPreventive = 0;

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
        this.departments = data;
        this.filteredDepartments = data;
        this.isLoading = false;
        this.buildChartData();
      },
      error: (err: any) => {
        console.error('Gagal load departments', err);
        this.errorMessage = 'Gagal memuat data.';
        this.isLoading = false;
      },
    });
  }

  // ===== BUILD CHART DATA =====
  buildChartData() {
    const baseDate = new Date(2026, 0, 1);
    this.chartMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    if (!this.departments || this.departments.length === 0) {
      this.chartData = [];
      this.totalPcPreventive = 0;
      return;
    }

    const allItems: any[] = [];
    let totalAsset = 0;

    for (const dept of this.filteredDepartments) {
      for (const sched of dept.schedules) {
        if (!sched.is_active) continue;
        totalAsset += sched.total_aset || 0;

        const startDate = new Date(sched.created_at);
        let durationDays = sched.frekuensi;
        if (sched.satuan === 'minggu') durationDays *= 7;
        else if (sched.satuan === 'bulan') durationDays *= 30;
        else if (sched.satuan === 'tahun') durationDays *= 365;
        const endDateCalc = new Date(startDate);
        endDateCalc.setDate(endDateCalc.getDate() + durationDays);

        const startOffset = this.getMonthOffset(startDate, baseDate);
        const endOffset = this.getMonthOffset(endDateCalc, baseDate);

        if (endOffset < 0 || startOffset > 11) continue;

        // 🔥 Ambil progress dari assignment (sementara random, nanti dari API)
        const progress = Math.floor(Math.random() * 101);
        let status = 'plan';
        if (progress >= 100) status = 'approve';
        else if (progress >= 80) status = 'complete';
        else if (progress > 0) status = 'progress';

        allItems.push({
          departemen: dept.nama_departemen,
          nama_schedule: sched.nama_schedule || sched.nama || '-',
          total_aset: sched.total_aset || 0,
          startOffset: Math.max(0, startOffset),
          endOffset: Math.min(11, endOffset),
          durationDays,
          status,
          progress,
        });
      }
    }

    this.totalPcPreventive = totalAsset;
    this.chartData = allItems;
  }

  getMonthOffset(date: Date, base: Date): number {
    const diffMonths = (date.getFullYear() - base.getFullYear()) * 12 + (date.getMonth() - base.getMonth());
    return diffMonths;
  }

  // 🔥 Warna untuk chart
  getChartStatusColor(status: string): string {
    const colors: any = {
      plan: '#1e293b',      // hitam/gelap
      progress: '#f59e0b',  // kuning
      complete: '#2563eb',  // biru
      approve: '#22c55e',   // hijau
    };
    return colors[status] || '#94a3b8';
  }

  getChartStatusLabel(status: string): string {
    const labels: any = {
      plan: 'Preventive Plan',
      progress: 'In Progress',
      complete: 'Complete',
      approve: 'Complete & Approve',
    };
    return labels[status] || status;
  }

  getDaysPerMonth(item: any, monthIndex: number): number {
    const totalMonths = item.endOffset - item.startOffset + 1;
    if (totalMonths <= 0) return 0;
    return Math.round(item.durationDays / totalMonths);
  }

  // ===== FILTER =====
  filterDepartments(event: any) {
    const query = event.target.value.toLowerCase().trim();
    this.filteredDepartments = this.departments.filter((d) =>
      d.nama_departemen.toLowerCase().includes(query)
    );
    this.buildChartData();
  }

  onFilterChange() {
    let filtered = [...this.departments];
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d => d.nama_departemen.toLowerCase().includes(q));
    }
    if (this.filterDept) {
      filtered = filtered.filter(d => d.nama_departemen === this.filterDept);
    }
    if (this.filterStatus) {
      const isActive = this.filterStatus === 'Aktif';
      filtered = filtered.map(dept => ({
        ...dept,
        schedules: dept.schedules.filter(s => s.is_active === isActive)
      })).filter(dept => dept.schedules.length > 0 || this.filterStatus === '');
    }
    this.filteredDepartments = filtered;
    this.buildChartData();
  }

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
      this.formData.id_departemen = deptId;
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
    this.formData = {
      id: sId,
      nama: schedule.nama_schedule || '',
      id_departemen: schedule.id_departemen,
      id_kategori: schedule.id_kategori,
      id_sub_kategori: schedule.id_sub_kategori,
      frekuensi: schedule.frekuensi,
      satuan: schedule.satuan,
      id_teknisi_utama: schedule.id_teknisi_utama,
      id_teknisi_pendamping: schedule.id_teknisi_pendamping,
      deskripsi: schedule.deskripsi || '',
      aset_list: [],
    };

    setTimeout(() => {
      this.onKategoriChange();
      this.onDepartemenChange();
    }, 200);

    this.scheduleService.getAssetsBySchedule(sId).subscribe({
      next: (data: any[]) => {
        this.formData.aset_list = data.map((a: any) => a.kode_asset);
      },
      error: (err: any) => console.error('Gagal load aset', err),
    });
    this.isModalOpen = true;
  }

  loadDropdownOptions() {
    this.departemenService.getAll().subscribe((data: any) => {
      this.departemenOptions = Array.isArray(data) ? data : data.data;
    });

    this.kategoriService.getAll().subscribe((data: any) => {
      this.kategoriOptions = Array.isArray(data) ? data : data.data;
    });

    this.subKategoriService.getAll().subscribe((data: any) => {
      this.allSubKategori = Array.isArray(data) ? data : data.data;
    });

    this.teknisiService.getAll().subscribe((data: any) => {
      this.teknisiOptions = Array.isArray(data) ? data : data.data;
    });

    this.inventoryService.getAll().subscribe({
      next: (data: any) => {
        this.allAssets = Array.isArray(data) ? data : data.data;
        if (this.formData.id_departemen) {
          this.onDepartemenChange();
        }
      },
      error: (err) => {
        console.error('❌ Gagal load inventory:', err);
        this.allAssets = [];
        this.availableAssets = [];
      }
    });
  }

  onDepartemenChange() {
    const selectedDeptId = this.formData.id_departemen;
    if (selectedDeptId) {
      const selectedDept = this.departemenOptions.find((d: any) => 
        Number(d.id_departemen || d.id) === Number(selectedDeptId)
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
        const katId = sk.idKategori ??
                      sk.id_kategori ??
                      sk.kategori_id ??
                      sk.id_master_kategori;

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

    const payload = {
      nama_schedule: this.formData.nama,
      id_departemen: this.formData.id_departemen,
      id_kategori: this.formData.id_kategori,
      id_sub_kategori: this.formData.id_sub_kategori,
      frekuensi: this.formData.frekuensi,
      satuan: this.formData.satuan,
      id_teknis: this.formData.id_teknisi_utama ? [this.formData.id_teknisi_utama] : [],
      deskripsi: this.formData.deskripsi,
      aset_list: this.formData.aset_list,
    };

    if (this.isEditing) {
      this.scheduleService.update(this.formData.id, payload).subscribe({
        next: () => {
          this.isModalOpen = false;
          this.loadData();
        },
        error: (err: any) => {
          console.error('Gagal update', err);
          alert('Gagal update schedule: ' + (err?.error?.message || 'Terjadi kesalahan'));
        },
      });
    } else {
      this.scheduleService.create(payload).subscribe({
        next: () => {
          this.isModalOpen = false;
          this.loadData();
        },
        error: (err: any) => {
          console.error('Gagal tambah', err);
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
          const totalAktif = this.selectedDepartment.schedules.filter((s) => s.is_active).length;
          this.selectedDepartment.total_aktif = totalAktif;
        } else {
          this.loadData();
        }
      },
      error: (err: any) => {
        console.error('Gagal mengubah status schedule', err);
        alert('Gagal mengubah status schedule');
      }
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
        }
      });
    }
  }

  openAssetModal(schedule: Schedule) {
    this.assetModalScheduleId = schedule.id_schedule!;
    this.assetModalScheduleName = schedule.nama_schedule || '';
    this.isAssetModalOpen = true;

    this.scheduleService.getAssetsBySchedule(this.assetModalScheduleId).subscribe({
      next: (data: any[]) => {
        this.assetList = data;
        this.filteredAssetList = data;
        this.assetCurrentPage = 1;
      },
      error: (err: any) => {
        console.error('Gagal memuat aset terkait', err);
        this.assetList = [];
        this.filteredAssetList = [];
      }
    });
  }

  closeAssetModal() {
    this.isAssetModalOpen = false;
    this.assetModalScheduleId = null;
    this.assetModalScheduleName = '';
  }

  filterAssets(event: any) {
    const query = event.target.value.toLowerCase().trim();
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

  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatusColor(schedule: Schedule): string {
    return schedule.is_active ? 'success' : 'medium';
  }

  getStatusBadge(schedule: Schedule): string {
    return schedule.is_active ? 'Aktif' : 'Nonaktif';
  }

  getProgress(schedule: Schedule): number {
    return (schedule as any).progress || 0;
  }

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