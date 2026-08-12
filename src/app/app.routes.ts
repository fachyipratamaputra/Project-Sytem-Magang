import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },

  // ===== HALAMAN ADMIN =====
  {
    path: 'dashboard',
    loadComponent: () => import('./Admin/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'list',
    loadComponent: () => import('./Admin/list/list.page').then(m => m.ListTicketPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'approval',
    loadComponent: () => import('./Admin/approval/approval.page').then(m => m.ApprovalTicketPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'assignment',
    loadComponent: () => import('./Admin/assignment/assignment.page').then(m => m.AssignmentTicketPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'karyawan',
    loadComponent: () => import('./Admin/karyawan/karyawan.page').then(m => m.KaryawanPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./Admin/users/users.page').then(m => m.UsersPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'jabatan',
    loadComponent: () => import('./Admin/jabatan/jabatan.page').then(m => m.JabatanPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'departemen',
    loadComponent: () => import('./Admin/departemen/departemen.page').then(m => m.DepartemenPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'bagian-departemen',
    loadComponent: () => import('./Admin/bagian-departemen/bagian-departemen.page').then(m => m.BagianDepartemenPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'kategori',
    loadComponent: () => import('./Admin/kategori/kategori.page').then(m => m.KategoriPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'sub-kategori',
    loadComponent: () => import('./Admin/sub-kategori/sub-kategori.page').then(m => m.SubKategoriPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'teknisi',
    loadComponent: () => import('./Admin/teknisi/teknisi.page').then(m => m.TeknisiPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'inventory',
    loadComponent: () => import('./Admin/inventory/inventory.page').then(m => m.InventoryPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'laporan-feedback',
    loadComponent: () => import('./Admin/feedback/feedback.page').then(m => m.LaporanFeedbackPage),
    canActivate: [AuthGuard]
  },
  // ✅ TAMBAHKAN ROUTE SCHEDULE PREVENTIVE DI SINI (Admin)
  {
    path: 'schedule',
    loadComponent: () => import('./Admin/schedule/schedule.page').then(m => m.SchedulePage),
    canActivate: [AuthGuard]
  },

  // ===== HALAMAN TEKNISI =====
  {
    path: 'teknisi/dashboard',
    loadComponent: () => import('./Teknisi/dashborad/dashborad.page').then(m => m.TeknisiDashboardPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'teknisi/ticket',
    loadComponent: () => import('./Teknisi/ticket/ticket.page').then(m => m.TeknisiTicketPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'teknisi/proses',
    loadComponent: () => import('./Teknisi/proses/proses.page').then(m => m.ProsesTiketPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'teknisi/riwayat',
    loadComponent: () => import('./Teknisi/riwayat/riwayat.page').then(m => m.RiwayatTiketPage),
    canActivate: [AuthGuard]
  },

  // ===== HALAMAN USERS =====
  {
    path: 'users/dashboard',
    loadComponent: () => import('./Users/dashboard/dashboard.page').then(m => m.UsersDashboardPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'users/my-ticket',
    loadComponent: () => import('./Users/myticket/myticket.page').then(m => m.MyTicketPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'users/feedback',
    loadComponent: () => import('./Users/feedback/feedback.page').then(m => m.FeedbackPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'users/input-aset',
    loadComponent: () => import('./Users/asset/asset.page').then(m => m.AssetPage),
    canActivate: [AuthGuard]
  },

  // ===== WILDCARD (HARUS DI PALING AKHIR) =====
  {
    path: '**',
    redirectTo: 'login'
  }
];