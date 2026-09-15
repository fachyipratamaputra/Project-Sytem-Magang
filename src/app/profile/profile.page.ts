import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TicketService } from '../../app/services/ticket.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AdminProfilePage implements OnInit {
  isSidebarOpen = false;
  user = { nama: 'Admin', role: 'Admin' };

  // Tanda tangan digital dipakai juga oleh Admin/IT Service saat approve checklist
  currentSignatureUrl: string | null = null;
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  isUploading = false;

  constructor(
    private router: Router,
    private ticketService: TicketService
  ) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'Admin';
        // level di backend bisa 'Admin' atau 'IT Service' - dipakai apa adanya
        this.user.role = parsed.level || parsed.role || 'Admin';
      } catch (e) {}
    }
    this.loadSignature();
  }

  loadSignature() {
    this.ticketService.getMySignature().subscribe({
      next: (res: { tanda_tangan: string | null }) => {
        this.currentSignatureUrl = res.tanda_tangan
          ? `${environment.apiUrl.replace(/\/api\/?$/, '')}${res.tanda_tangan}`
          : null;
      },
      error: (err: any) => console.error('Gagal memuat tanda tangan', err),
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('File harus berupa gambar PNG atau JPG');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => (this.previewUrl = e.target.result);
    reader.readAsDataURL(file);
  }

  uploadSignature() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.ticketService.uploadMySignature(this.selectedFile).subscribe({
      next: () => {
        this.isUploading = false;
        this.selectedFile = null;
        this.previewUrl = null;
        alert('Tanda tangan berhasil disimpan');
        this.loadSignature();
      },
      error: (err: any) => {
        this.isUploading = false;
        alert(err?.error?.message || 'Gagal menyimpan tanda tangan');
      },
    });
  }

  cancelPreview() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }

  // ===== Navigasi sidebar - identik dengan dashboard.page.ts Admin =====
  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToListTicket() { this.router.navigate(['/list']); }
  goToApprovalTicket() { this.router.navigate(['/approval']); }
  goToAssignmentTicket() { this.router.navigate(['/assignment']); }
  goToKaryawan() { this.router.navigate(['/karyawan']); }
  goToUser() { this.router.navigate(['/users']); }
  goToJabatan() { this.router.navigate(['/jabatan']); }
  goToDepartemen() { this.router.navigate(['/departemen']); }
  goToBagianDepartemen() { this.router.navigate(['/bagian-departemen']); }
  goToTeknisi() { this.router.navigate(['/teknisi']); }
  goToInventory() { this.router.navigate(['/inventory']); }
  goToSchedule() { this.router.navigate(['/schedule']); }
  goToKategori() { this.router.navigate(['/kategori']); }
  goToSubKategori() { this.router.navigate(['/sub-kategori']); }
  goToLaporanFeedback() { this.router.navigate(['/laporan-feedback']); }
  goToStatistikTicket() { this.router.navigate(['/statistik-ticket']); }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}