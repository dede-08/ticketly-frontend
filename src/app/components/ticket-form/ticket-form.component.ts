import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { TicketService, Category, Priority, Status } from '../../services/ticket.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, 
    ReactiveFormsModule
  ],
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.css'
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
  loading = signal(true);
  submitting = signal(false);
  error = signal('');
  isEditMode = signal(false);
  ticketId?: number;

  ngOnInit() {
    this.initForm();
    this.loadData();
    
    // Verificar si estamos en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.ticketId = +params['id'];
        this.isEditMode.set(true);
        this.loadTicket(this.ticketId);
      }
    });
  }

  initForm() {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      priority: ['', Validators.required],
      status: ['', Validators.required],
      tagsInput: ['']
    });
  }

  loadData() {
    Promise.all([
      this.ticketService.getCategories().toPromise(),
      this.ticketService.getPriorities().toPromise(),
      this.ticketService.getStatuses().toPromise()
    ]).then(([categories, priorities, statuses]) => {
      this.categories.set(categories || []);
      this.priorities.set(priorities || []);
      this.statuses.set(statuses || []);
      
      // Establecer valor por defecto para estado "Abierto" si no es modo edición
      if (!this.isEditMode()) {
        const openStatus = statuses?.find(s => s.name === 'OPEN');
        if (openStatus) {
          this.ticketForm.patchValue({ status: openStatus.id });
        }
      }
      
      this.loading.set(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      this.error.set('Error al cargar los datos');
      this.loading.set(false);
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
          tagsInput: ticket.tags.join(', ')
        });
      },
      error: (error) => {
        console.error('Error loading ticket:', error);
        this.error.set('Error al cargar el ticket');
      }
    });
  }

  onSubmit() {
    if (this.ticketForm.invalid) {
      Object.keys(this.ticketForm.controls).forEach(key => {
        this.ticketForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    const formValue = this.ticketForm.value;
    const tags = formValue.tagsInput 
      ? formValue.tagsInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
      : [];

    const ticketData = {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      priority: formValue.priority,
      status: formValue.status,
      tags: tags
    };

    const operation = this.isEditMode() && this.ticketId
      ? this.ticketService.updateTicket(this.ticketId, ticketData)
      : this.ticketService.createTicket(ticketData);

    operation.subscribe({
      next: (ticket) => {
        this.submitting.set(false);
        this.router.navigate(['/tickets', ticket.id]);
      },
      error: (error) => {
        console.error('Error saving ticket:', error);
        this.error.set('Error al guardar el ticket. Por favor intenta de nuevo.');
        this.submitting.set(false);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/tickets']);
  }
}