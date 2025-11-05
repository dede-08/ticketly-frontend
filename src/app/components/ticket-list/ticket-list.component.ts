import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService, Ticket, Category, Priority, Status } from '../../services/ticket.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.css'
})
export class TicketListComponent implements OnInit {
  private ticketService = inject(TicketService);
  
  tickets = signal<Ticket[]>([]);
  categories = signal<Category[]>([]);
  priorities = signal<Priority[]>([]);
  statuses = signal<Status[]>([]);
  loading = signal(true);

  searchTerm = '';
  filterStatus = '';
  filterPriority = '';
  filterCategory = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    
    // Cargar tickets y datos auxiliares en paralelo
    Promise.all([
      this.ticketService.getTickets().toPromise(),
      this.ticketService.getCategories().toPromise(),
      this.ticketService.getPriorities().toPromise(),
      this.ticketService.getStatuses().toPromise()
    ]).then(([tickets, categories, priorities, statuses]) => {
      this.tickets.set(tickets || []);
      this.categories.set(categories || []);
      this.priorities.set(priorities || []);
      this.statuses.set(statuses || []);
      this.loading.set(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      this.loading.set(false);
    });
  }

  applyFilters() {
    const params: any = {};
    
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }
    if (this.filterStatus) {
      params.status = this.filterStatus;
    }
    if (this.filterPriority) {
      params.priority = this.filterPriority;
    }
    if (this.filterCategory) {
      params.category = this.filterCategory;
    }

    this.loading.set(true);
    this.ticketService.getTickets(params).subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error filtering tickets:', error);
        this.loading.set(false);
      }
    });
  }

  getStatusClass(statusName: string): string {
    const classes: Record<string, string> = {
      'OPEN': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'ON_HOLD': 'bg-orange-100 text-orange-800',
      'RESOLVED': 'bg-green-100 text-green-800',
      'CLOSED': 'bg-gray-100 text-gray-800'
    };
    return classes[statusName] || 'bg-gray-100 text-gray-800';
  }
}
