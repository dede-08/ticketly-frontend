import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'tickets',
    loadComponent: () =>
      import('./features/tickets/ticket-list/ticket-list.component').then(
        (m) => m.TicketListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'tickets/new',
    loadComponent: () =>
      import('./features/tickets/ticket-form/ticket-form.component').then(
        (m) => m.TicketFormComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'tickets/:id',
    loadComponent: () =>
      import('./features/tickets/ticket-detail/ticket-detail.component').then(
        (m) => m.TicketDetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'tickets/:id/edit',
    loadComponent: () =>
      import('./features/tickets/ticket-form/ticket-form.component').then(
        (m) => m.TicketFormComponent
      ),
    canActivate: [authGuard],
  },
  {
    // desconocido: al dashboard; el guard redirige a /login si no hay sesión
    path: '**',
    redirectTo: '/dashboard',
  },
];
