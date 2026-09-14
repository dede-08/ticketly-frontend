import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket, Category, Priority, Status } from '../../../models/ticket.model';
import { LoggerService } from '../../../core/services/logger.service';
import { StatusClassPipe } from '../../../shared/pipes/status-class.pipe';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusClassPipe],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.css',
})
export class TicketListComponent implements OnInit {
  private ticketService = inject(TicketService);
  private logger = inject(LoggerService);
  private destroyRef = inject(DestroyRef);

  tickets = signal<Ticket[]>([]);
  categories = signal<Category[]>([]);
  priorities = signal<Priority[]>([]);
  statuses = signal<Status[]>([]);
  loading = signal(true);

  searchTerm = '';
  filterStatus = '';
  filterPriority = '';
  filterCategory = '';

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadData();

    //evita una petición por tecla: solo filtra tras 300ms sin escribir
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
  }

  loadData(): void {
    this.loading.set(true);

    forkJoin({
      tickets: this.ticketService.getTickets().pipe(
        catchError((err: unknown) => {
          this.logger.error('Error loading tickets:', err);
          return of([]); //devuelve un array vacio en caso de error
        })
      ),
      categories: this.ticketService.getCategories().pipe(
        catchError((err: unknown) => {
          this.logger.error('Error loading categories:', err);
          return of([]);
        })
      ),
      priorities: this.ticketService.getPriorities().pipe(
        catchError((err: unknown) => {
          this.logger.error('Error loading priorities:', err);
          return of([]);
        })
      ),
      statuses: this.ticketService.getStatuses().pipe(
        catchError((err: unknown) => {
          this.logger.error('Error loading statuses:', err);
          return of([]);
        })
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ tickets, categories, priorities, statuses }) => {
          this.tickets.set(tickets || []);
          this.categories.set(categories || []);
          this.priorities.set(priorities || []);
          this.statuses.set(statuses || []);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.logger.error('Error in forkJoin:', error);
          this.loading.set(false);
        },
      });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  applyFilters(): void {
    const params: Record<string, string> = {};

    if (this.searchTerm) {
      params['search'] = this.searchTerm;
    }
    if (this.filterStatus) {
      params['status'] = this.filterStatus;
    }
    if (this.filterPriority) {
      params['priority'] = this.filterPriority;
    }
    if (this.filterCategory) {
      params['category'] = this.filterCategory;
    }

    this.loading.set(true);
    this.ticketService
      .getTickets(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tickets) => {
          this.tickets.set(tickets);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.logger.error('Error filtering tickets:', error);
          this.loading.set(false);
        },
      });
  }
}
