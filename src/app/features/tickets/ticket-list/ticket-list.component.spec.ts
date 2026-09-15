import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TicketListComponent } from './ticket-list.component';
import { TicketService } from '../../../core/services/ticket.service';

describe('TicketListComponent', () => {
  let component: TicketListComponent;
  let fixture: ComponentFixture<TicketListComponent>;
  let ticketSpy: jasmine.SpyObj<TicketService>;

  beforeEach(async () => {
    ticketSpy = jasmine.createSpyObj<TicketService>('TicketService', [
      'getTickets',
      'getCategories',
      'getPriorities',
      'getStatuses',
    ]);
    ticketSpy.getTickets.and.returnValue(of([]));
    ticketSpy.getCategories.and.returnValue(of([]));
    ticketSpy.getPriorities.and.returnValue(of([]));
    ticketSpy.getStatuses.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [TicketListComponent],
      providers: [{ provide: TicketService, useValue: ticketSpy }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carga tickets y catálogos al iniciar', () => {
    expect(ticketSpy.getTickets).toHaveBeenCalled();
    expect(ticketSpy.getCategories).toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });

  it('applyFilters envía todos los filtros activos', () => {
    component.searchTerm = 'bug';
    component.filterStatus = '1';
    component.filterPriority = '2';
    component.filterCategory = '3';

    component.applyFilters();

    expect(ticketSpy.getTickets).toHaveBeenCalledWith({
      search: 'bug',
      status: '1',
      priority: '2',
      category: '3',
    });
  });

  it('la búsqueda espera 300ms sin escribir (debounce)', fakeAsync(() => {
    ticketSpy.getTickets.calls.reset();

    component.searchTerm = 'a';
    component.onSearchInput();
    component.searchTerm = 'ab';
    component.onSearchInput();

    tick(299);
    expect(ticketSpy.getTickets).not.toHaveBeenCalled();

    tick(1);
    expect(ticketSpy.getTickets).toHaveBeenCalledTimes(1);
  }));
});
