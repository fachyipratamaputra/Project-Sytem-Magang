import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export interface Inventory {
  kodeAsset: string;
  namaBarang: string;
  merkModel: string;
  dept: string;
  kategori: string;
  pemegang: string;
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class InventoryPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'inventory';

  // ===== DATA INVENTORY =====
  inventoryList: Inventory[] = [
    { kodeAsset: 'AST-0001', namaBarang: 'Monitor', merkModel: 'Samsung 19"', dept: 'IT', kategori: 'Hardware', pemegang: 'Dewi' },
    { kodeAsset: 'AST-0002', namaBarang: 'Laptop', merkModel: 'Lenovo ThinkPad', dept: 'IT', kategori: 'Hardware', pemegang: 'Desi' },
    { kodeAsset: 'AST-0003', namaBarang: 'Printer', merkModel: 'Epson L3110', dept: 'IT', kategori: 'Hardware', pemegang: 'Yulita' },
    { kodeAsset: 'AST-0004', namaBarang: 'Switch Jaringan', merkModel: 'Cisco 24 Port', dept: 'IT', kategori: 'Jaringan', pemegang: 'Rian' },
  ];

  // ==== FILTER ====
  searchTerm = '';
  filterDept = '';
  filterKategori = '';
  deptOptions: string[] = [];
  kategoriOptions: string[] = [];

  // ==== PAGINATION ====
  currentPage = 1;
  pageSize = 10;

  // ==== STATE MODAL ====
  isModalOpen = false;
  isEditing = false;
  selectedKode: string | null = null;
  formData: any = {
    namaBarang: '',
    merkModel: '',
    dept: '',
    kategori: '',
    pemegang: '',
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.buildFilterOptions();
  }

  private buildFilterOptions() {
    this.deptOptions = [...new Set(this.inventoryList.map((i) => i.dept))];
    this.kategoriOptions = [...new Set(this.inventoryList.map((i) => i.kategori))];
  }

  // ===== LOGIKA FILTER & PAGINATION =====
  get filteredInventory(): Inventory[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.inventoryList.filter((i) => {
      const matchSearch =
        !term ||
        i.kodeAsset.toLowerCase().includes(term) ||
        i.namaBarang.toLowerCase().includes(term) ||
        i.pemegang.toLowerCase().includes(term);
      const matchDept = !this.filterDept || i.dept === this.filterDept;
      const matchKategori = !this.filterKategori || i.kategori === this.filterKategori;
      return matchSearch && matchDept && matchKategori;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredInventory.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedInventory(): Inventory[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredInventory.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ===== FUNGSI MODAL =====
  openTambahModal() {
    this.isEditing = false;
    this.selectedKode = null;
    this.formData = { namaBarang: '', merkModel: '', dept: '', kategori: '', pemegang: '' };
    this.isModalOpen = true;
  }

  openEditModal(item: Inventory) {
    this.isEditing = true;
    this.selectedKode = item.kodeAsset;
    this.formData = { ...item }; // Kode asset ikut terbawa
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanInventory() {
    if (!this.formData.namaBarang) {
      alert('Nama Barang wajib diisi!');
      return;
    }

    if (this.isEditing && this.selectedKode !== null) {
      // Update data (Kode Asset tetap menggunakan yang lama)
      const index = this.inventoryList.findIndex(i => i.kodeAsset === this.selectedKode);
      if (index !== -1) {
        this.inventoryList[index] = { ...this.formData, kodeAsset: this.selectedKode };
      }
    } else {
      // 🔥 GENERATE KODE ASSET OTOMATIS SAAT SIMPAN
      let maxNum = 0;
      if (this.inventoryList.length > 0) {
        this.inventoryList.forEach(item => {
          const parts = item.kodeAsset.split('-');
          if (parts.length === 2 && parts[0] === 'AST') {
            const num = parseInt(parts[1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        });
      }
      const newKodeNum = maxNum + 1;
      const newKode = 'AST-' + String(newKodeNum).padStart(4, '0');

      // Tambah data baru dengan kode yang sudah digenerate
      this.inventoryList.push({ ...this.formData, kodeAsset: newKode });
    }

    this.buildFilterOptions();
    this.closeModal();
    alert(this.isEditing ? 'Data asset berhasil diperbarui!' : 'Asset berhasil ditambahkan!');
  }

  hapusInventory(item: Inventory) {
    if (confirm(`Apakah Anda yakin ingin menghapus asset "${item.kodeAsset}" (${item.namaBarang})?`)) {
      this.inventoryList = this.inventoryList.filter(i => i.kodeAsset !== item.kodeAsset);
      this.buildFilterOptions();
      this.onFilterChange();
    }
  }

  // ===== NAVIGASI & SIDEBAR =====
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) { this.activeMenu = menu; }

  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToListTicket() { this.router.navigate(['/list']); }
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
  goToInventory() { this.activeMenu = 'inventory'; this.router.navigate(['/inventory']); }
  
  goToLaporanFeedback() {
    this.setActiveMenu('laporan-feedback');
    this.router.navigate(['/laporan-feedback']); 
  }
  goToStatistikTicket() { this.activeMenu = 'statistik-ticket'; }
  goToProfile() { this.activeMenu = 'profile'; }
}