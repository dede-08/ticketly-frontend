import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ticket, TicketService, TicketStatistics } from '../../services/ticket.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private ticketService = inject(TicketService);

  statistics = signal<TicketStatistics | null>(null);
  myTickets = signal<Ticket[]>([]);
  assignedTickets = signal<Ticket[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading.set(true);

    Promise.all([
      this.ticketService.getStatistics().toPromise(),
      this.ticketService.getMyTickets().toPromise(),
      this.ticketService.getAssignedToMe().toPromise(),
    ])
      .then(([stats, myTickets, assignedTickets]) => {
        this.statistics.set(stats || null);
        this.myTickets.set(myTickets || []);
        this.assignedTickets.set(assignedTickets || []);
        this.loading.set(false);
      })
      .catch((error) => {
        console.error('Error loading dashboard data:', error);
        this.loading.set(false);
      });
  }

  getPriorityLabel(priorityName: string): string {
    const labels: Record<string, string> = {
      LOW: 'Baja',
      MEDIUM: 'Media',
      HIGH: 'Alta',
      CRITICAL: 'Crítica',
    };
    return labels[priorityName] || priorityName;
  }

  getStatusClass(statusName: string): string {
    const classes: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      ON_HOLD: 'bg-orange-100 text-orange-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return classes[statusName] || 'bg-gray-100 text-gray-800';
  }
}
