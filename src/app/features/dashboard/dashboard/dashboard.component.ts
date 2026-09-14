import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket, TicketStatistics } from '../../../models/ticket.model';
import { LoggerService } from '../../../core/services/logger.service';
import { StatusClassPipe } from '../../../shared/pipes/status-class.pipe';
import { PriorityLabelPipe } from '../../../shared/pipes/priority-label.pipe';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusClassPipe, PriorityLabelPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private ticketService = inject(TicketService);
  private router = inject(Router);
  private logger = inject(LoggerService);
  private destroyRef = inject(DestroyRef);

  statistics = signal<TicketStatistics | null>(null);
  myTickets = signal<Ticket[]>([]);
  assignedTickets = signal<Ticket[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadDashboardData();

    //recargar datos cuando el usuario regresa al dashboard
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/dashboard' || event.url === '/') {
          this.loadDashboardData();
        }
      });
  }

  loadDashboardData(): void {
    this.loading.set(true);

    forkJoin({
      stats: this.ticketService.getStatistics(),
      myTickets: this.ticketService.getMyTicketsFiltered(),
      assignedTickets: this.ticketService.getAssignedToMe(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ stats, myTickets, assignedTickets }) => {
          this.logger.debug('Dashboard data loaded');
          this.statistics.set(stats ?? null);
          this.myTickets.set(myTickets ?? []);
          this.assignedTickets.set(assignedTickets ?? []);

          if ((assignedTickets ?? []).length === 0) {
            this.logger.warn(
              'No hay tickets asignados con assigned_to_me. Intentando fallback con filtro general asignado...'
            );
            this.ticketService
              .getTickets({ assigned_to_me: 'true' })
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (fallbackAssigned) => {
                  if (fallbackAssigned && fallbackAssigned.length > 0) {
                    this.assignedTickets.set(fallbackAssigned);
                  }
                },
                error: (err: unknown) => {
                  this.logger.error('El fallback assigned_to_me también falló:', err);
                },
              });
          }

          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.logger.error('Error loading dashboard data:', error);
          this.loading.set(false);
        },
      });
  }
}
