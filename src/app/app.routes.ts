import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tickets',
    loadComponent: () => import('./components/ticket-list/ticket-list.component').then(m => m.TicketListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tickets/new',
    loadComponent: () => import('./components/ticket-form/ticket-form.component').then(m => m.TicketFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tickets/:id',
    loadComponent: () => import('./components/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tickets/:id/edit',
    loadComponent: () => import('./components/ticket-form/ticket-form.component').then(m => m.TicketFormComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];