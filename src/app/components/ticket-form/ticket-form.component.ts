import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  TicketService,
  User,
  Category,
  Priority,
  Status,
  TicketCreate,
  Ticket,
} from '../../services/ticket.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.css',
})
export class TicketFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ticketForm!: FormGroup;
  categories = signal<Category[]>([]);
  priorities = signal<Priority[]>([]);
  statuses = signal<Status[]>([]);
  users = signal<User[]>([]);
  loading = signal(true);
  submitting = signal(false);
  error = signal('');
  isEditMode = signal(false);
  ticketId?: number;

  ngOnInit() {
    this.initForm();
    this.loading.set(true);
    this.loadData()
      .then(() => {
        this.route.params.subscribe((params) => {
          if (params['id']) {
            this.ticketId = +params['id'];
            this.isEditMode.set(true);
            this.loadTicket(this.ticketId);
          } else {
            this.loading.set(false);
          }
        });
      })
      .catch(() => {
        this.loading.set(false);
      });
  }

  initForm() {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      priority: ['', Validators.required],
      status: ['', Validators.required],
      assigned_to: [''],
      tagsInput: [''],
    });
  }

  loadData(): Promise<any> {
    const usersPromise = this.ticketService
      .getUsers()
      .toPromise()
      .catch((error) => {
        console.warn(
          'No se pudieron cargar usuarios, continuará con formulario sin asignación:',
          error
        );
        return [] as User[];
      });

    return Promise.all([
      this.ticketService.getCategories().toPromise(),
      this.ticketService.getPriorities().toPromise(),
      this.ticketService.getStatuses().toPromise(),
      usersPromise,
    ])
      .then(([categories, priorities, statuses, users]) => {
        this.categories.set(categories || []);
        this.priorities.set(priorities || []);
        this.statuses.set(statuses || []);
        this.users.set(users || []);

        console.warn('ticket-form loadData:', {
          categories: this.categories(),
          priorities: this.priorities(),
          statuses: this.statuses(),
          users: this.users(),
        });

        const openStatus = statuses?.find((s) => s.name === 'OPEN');
        if (openStatus) {
          this.ticketForm.patchValue({ status: openStatus.id });
        }
      })
      .catch((error) => {
        console.error('Error loading datos:', error);
        this.error.set('Error al cargar los datos');
        throw error;
      });
  }

  loadTicket(id: number) {
    this.ticketService.getTicket(id).subscribe({
      next: (ticket) => {
        this.ticketForm.patchValue({
          title: ticket.title,
          description: ticket.description,
          category: ticket.category.id,
          priority: ticket.priority.id,
          status: ticket.status.id,
          assigned_to: ticket.assigned_to ? ticket.assigned_to.id : '',
          tagsInput: ticket.tags.join(', '),
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading ticket:', error);
        this.error.set('Error al cargar el ticket');
        this.loading.set(false);
      },
    });
  }

  onSubmit() {
    if (this.ticketForm.invalid) {
      Object.keys(this.ticketForm.controls).forEach((key) => {
        this.ticketForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    const formValue = this.ticketForm.value;
    const tags = formValue.tagsInput
      ? formValue.tagsInput
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag)
      : [];

    let operation: Observable<Ticket>;

    if (this.isEditMode() && this.ticketId) {
      const ticketData: Partial<Ticket> = {
        title: formValue.title,
        description: formValue.description,
        category: { id: formValue.category } as Category,
        priority: { id: formValue.priority } as Priority,
        status: { id: formValue.status } as Status,
        assigned_to: formValue.assigned_to ? ({ id: formValue.assigned_to } as User) : null,
        tags: tags,
      };

      operation = this.ticketService.updateTicket(this.ticketId, ticketData);
    } else {
      const ticketData: TicketCreate = {
        title: formValue.title,
        description: formValue.description,
        category: formValue.category,
        priority: formValue.priority,
        status: formValue.status,
        assigned_to: formValue.assigned_to || null,
        tags: tags,
      };
      operation = this.ticketService.createTicket(ticketData);
    }

    operation.subscribe({
      next: (ticket) => {
        this.submitting.set(false);
        if (this.isEditMode()) {
          this.router.navigate(['/tickets', ticket.id]);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error saving ticket:', error);
        this.error.set('Error al guardar el ticket. Por favor intenta de nuevo.');
        this.submitting.set(false);
      },
    });
  }

  onCancel() {
    this.router.navigate(['/tickets']);
  }
}
