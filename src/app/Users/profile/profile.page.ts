import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TicketService } from '../../services/ticket.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-users-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class UsersProfilePage implements OnInit {
  isSidebarOpen = false;
  user = { nama: 'User', role: 'Users' };

  // Users biasanya tidak approve checklist, tapi tanda tangan tetap disediakan
  // untuk jaga-jaga kalau ke depan dipakai (mis. approval "Diketahui" User)
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
        this.user.nama = parsed.nama || 'User';
        this.user.role = parsed.role || 'Users';
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

  // ===== Navigasi sidebar - identik dengan dashboard.page.ts Users =====
  goToDashboardUser() { this.router.navigate(['/users/dashboard']); }
  goToMyTicket() { this.router.navigate(['/users/my-ticket']); }
  goToInputAset() { this.router.navigate(['/users/input-aset']); }
  goToLaporanFeedback() { this.router.navigate(['/users/feedback']); }
  goToPengaturan() { /* halaman pengaturan belum ada route-nya */ }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}