import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service'; // sesuaikan path sesuai lokasi file kamu

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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  login() {
    this.errorMessage = '';

    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Username dan password wajib diisi!';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginData.username, this.loginData.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.loginData.password = '';

        if (!res?.data?.token || !res?.data?.user) {
          this.errorMessage = 'Respons server tidak sesuai format yang diharapkan.';
          return;
        }

        const { token, user } = res.data;
        this.authService.saveSession(token, user);

        const targetRoute = this.authService.getDashboardRouteByLevel(user.level);
        this.router.navigate([targetRoute]);
      },
      error: (err) => {
        this.isLoading = false;
        // Backend mengirim pesan error lewat fail(res, message, statusCode)
        this.errorMessage = err?.error?.message || 'Username atau password salah!';
      }
    });
  }
}