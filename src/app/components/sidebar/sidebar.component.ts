import { Component, effect, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  authService = inject(AuthService);
  private logger = inject(LoggerService);

  constructor() {
    //effect para detectar cambios en currentUser (sin registrar datos personales)
    effect(() => {
      this.logger.debug('Usuario en navbar actualizado:', !!this.authService.currentUser());
    });
  }

  ngOnInit(): void {
    //forzar la carga del usuario si no está cargado (hay que suscribirse: sin subscribe no se emite)
    if (!this.authService.currentUser()) {
      this.logger.debug('No hay usuario en navbar, intentando cargar...');
      this.authService.loadUserInfo().subscribe();
    } else {
      this.logger.debug('Usuario ya cargado en navbar');
    }
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }
}
