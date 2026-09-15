import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

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

  // ===== HALAMAN ADMIN (IT Service juga pakai halaman ini) =====
  {
    path: 'dashboard',
    loadComponent: () => import('./Admin/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'IT Service'] }
  },
  {
    path: 'list',
    loadComponent: () => import('./Admin/list/list.page').then(m => m.ListTicketPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'IT Service'] }
  },
  {
    path: 'approval',
    loadComponent: () => import('./Admin/approval/approval.page').then(m => m.ApprovalTicketPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'IT Service'] }
  },
  {
    path: 'assignment',
    loadComponent: () => import('./Admin/assignment/assignment.page').then(m => m.AssignmentTicketPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'IT Service'] }
  },
  {
    path: 'karyawan',
    loadComponent: () => import('./Admin/karyawan/karyawan.page').then(m => m.KaryawanPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'users',
    loadComponent: () => import('./Admin/users/users.page').then(m => m.UsersPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'jabatan',
    loadComponent: () => import('./Admin/jabatan/jabatan.page').then(m => m.JabatanPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'departemen',
    loadComponent: () => import('./Admin/departemen/departemen.page').then(m => m.DepartemenPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'bagian-departemen',
    loadComponent: () => import('./Admin/bagian-departemen/bagian-departemen.page').then(m => m.BagianDepartemenPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'kategori',
    loadComponent: () => import('./Admin/kategori/kategori.page').then(m => m.KategoriPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'sub-kategori',
    loadComponent: () => import('./Admin/sub-kategori/sub-kategori.page').then(m => m.SubKategoriPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'teknisi',
    loadComponent: () => import('./Admin/teknisi/teknisi.page').then(m => m.TeknisiPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'inventory',
    loadComponent: () => import('./Admin/inventory/inventory.page').then(m => m.InventoryPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'laporan-feedback',
    loadComponent: () => import('./Admin/feedback/feedback.page').then(m => m.LaporanFeedbackPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'schedule',
    loadComponent: () => import('./Admin/schedule/schedule.page').then(m => m.SchedulePage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },

  // ===== HALAMAN TEKNISI =====
  {
    path: 'teknisi/dashboard',
    loadComponent: () => import('./Teknisi/dashborad/dashborad.page').then(m => m.TeknisiDashboardPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Teknisi'] }
  },
  {
    path: 'teknisi/ticket',
    loadComponent: () => import('./Teknisi/ticket/ticket.page').then(m => m.TeknisiTicketPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Teknisi'] }
  },
  {
    path: 'teknisi/proses',
    loadComponent: () => import('./Teknisi/proses/proses.page').then(m => m.ProsesTiketPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Teknisi'] }
  },
  {
    path: 'teknisi/riwayat',
    loadComponent: () => import('./Teknisi/riwayat/riwayat.page').then(m => m.RiwayatTiketPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Teknisi'] }
  },
  {
    path: 'teknisi/schedule-tersedia',
    loadComponent: () => import('./Teknisi/schedule/schedule.page').then(m => m.ScheduleTersediaPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Teknisi'] }
  },
  {
    path: 'teknisi/profile',
    loadComponent: () => import('./Teknisi/profile/profile.page').then(m => m.TeknisiProfilePage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Teknisi'] }
  },

  // ===== HALAMAN USERS =====
  {
    path: 'users/dashboard',
    loadComponent: () => import('./Users/dashboard/dashboard.page').then(m => m.UsersDashboardPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Users'] }
  },
  {
    path: 'users/my-ticket',
    loadComponent: () => import('./Users/myticket/myticket.page').then(m => m.MyTicketPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Users'] }
  },
  {
    path: 'users/feedback',
    loadComponent: () => import('./Users/feedback/feedback.page').then(m => m.FeedbackPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Users'] }
  },
  {
    path: 'users/input-aset',
    loadComponent: () => import('./Users/asset/asset.page').then(m => m.AssetPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Users'] }
  },
  {
    path: 'users/profile',
    loadComponent: () => import('./Users/profile/profile.page').then(m => m.UsersProfilePage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Users'] }
  },

  // ===== PROFILE ADMIN (juga dipakai IT Service, karena IT Service nebeng =====
  // ===== halaman Admin dan tidak punya folder terpisah)                   =====
  {
    path: 'profile',
    loadComponent: () => import('../app/profile/profile.page').then(m => m.AdminProfilePage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'IT Service'] }
  },

  // ===== WILDCARD (HARUS DI PALING AKHIR) =====
  {
    path: '**',
    redirectTo: 'login'
  },
];