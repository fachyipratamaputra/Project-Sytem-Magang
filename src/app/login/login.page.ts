import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class LoginPage implements OnInit {

  loginData = {
    username: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';

  // Data dummy role (Admin, Teknisi, Users)
  private dummyUsers = [
    { username: 'admin', password: '123456', role: 'admin', nama: 'Admin Helpdesk' },
    { username: 'teknisi', password: '123456', role: 'teknisi', nama: 'Muhlison' },
    { username: 'user', password: '123456', role: 'users', nama: 'Desi' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  login() {
    this.errorMessage = '';
    this.isLoading = true;

    // Simulasi proses login
    setTimeout(() => {
      const user = this.dummyUsers.find(
        u => u.username === this.loginData.username && u.password === this.loginData.password
      );

      if (user) {
        // Simpan data user dan token ke LocalStorage
        localStorage.setItem('token', 'fake-jwt-token-' + user.role);
        localStorage.setItem('user', JSON.stringify({
          nama: user.nama,
          role: user.role,
          username: user.username
        }));

        this.isLoading = false;
        this.loginData.password = '';

        // 🔥 PERHATIKAN BAGIAN INI (SUDAH DIPERBAIKI)
        if (user.role === 'admin') {
          this.router.navigate(['/dashboard']); // Admin masuk Dashboard Admin
        } else if (user.role === 'teknisi') {
          this.router.navigate(['/teknisi/dashboard']); // Teknisi masuk Dashboard Teknisi
        } else if (user.role === 'users') {
          // ✅ UBAH PATH INI MENJADI '/users/dashboard' (jamak, sesuai route yang kita buat)
          this.router.navigate(['/users/dashboard']); 
        }

      } else {
        this.isLoading = false;
        this.errorMessage = 'Username atau Password salah!';
      }
    }, 1000);
  }
}