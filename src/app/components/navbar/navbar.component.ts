import { Component, effect, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);

  constructor() {
    // Effect para detectar cambios en currentUser
    effect(() => {
      const user = this.authService.currentUser();
      console.warn('Usuario en navbar:', user);
    });
  }

  ngOnInit(): void {
    // Forzar la carga del usuario si no está cargado
    if (!this.authService.currentUser()) {
      console.warn('No hay usuario en navbar, intentando cargar...');
      this.authService.loadUserInfo();
    } else {
      console.warn('Usuario ya cargado en navbar:', this.authService.currentUser());
    }
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }
}
