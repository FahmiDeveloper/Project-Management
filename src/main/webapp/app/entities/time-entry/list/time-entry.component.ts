import { Component, NgZone, OnInit, computed, inject, signal } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { ITimeEntry } from '../time-entry.model';
import { EntityArrayResponseType, TimeEntryService } from '../service/time-entry.service';
import { TimeEntryDeleteDialogComponent } from '../delete/time-entry-delete-dialog.component';

import { ITask } from 'app/entities/task/task.model';
import { TaskService } from 'app/entities/task/service/task.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'jhi-time-entry',
  templateUrl: './time-entry.component.html',
  styleUrls: ['./time-entry.component.scss'],
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    FormatMediumDatetimePipe,
    FormatMediumDatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
})
export class TimeEntryComponent implements OnInit {
  subscription: Subscription | null = null;
  timeEntries = signal<ITimeEntry[]>([]);
  isLoading = false;

  displayedColumns: string[] = ['description', 'startTime', 'endTime', 'hours', 'entryDate', 'task', 'employee', 'note', 'actions'];

  // ---- Task filter (searchable autocomplete) ----
  filterTaskId = signal<number | null>(null);
  taskSearchTerm = signal<string>('');
  tasks = signal<ITask[]>([]);
  filteredTasks = computed(() => {
    const term = this.taskSearchTerm().toLowerCase().trim();
    if (!term) {
      return this.tasks();
    }
    return this.tasks().filter(t => (t.title ?? '').toLowerCase().includes(term));
  });

  // ---- Employee filter (searchable autocomplete) ----
  filterEmployeeId = signal<number | null>(null);
  employeeSearchTerm = signal<string>('');
  employees = signal<IEmployee[]>([]);
  filteredEmployees = computed(() => {
    const term = this.employeeSearchTerm().toLowerCase().trim();
    if (!term) {
      return this.employees();
    }
    return this.employees().filter(e => `${e.firstName ?? ''} ${e.lastName ?? ''}`.toLowerCase().includes(term));
  });

  sortState = sortStateSignal({});

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  public readonly router = inject(Router);
  protected readonly timeEntryService = inject(TimeEntryService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly taskService = inject(TaskService);
  protected readonly employeeService = inject(EmployeeService);

  trackId = (item: ITimeEntry): number => this.timeEntryService.getTimeEntryIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();

    this.taskService.query().subscribe(res => this.tasks.set(res.body ?? []));
    this.employeeService.query().subscribe(res => this.employees.set(res.body ?? []));
  }

  // ---- Task autocomplete handlers ----
  displayTaskTitle = (task: ITask | null): string => (task ? (task.title ?? '') : '');

  onTaskInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.taskSearchTerm.set(value);
  }

  onTaskSelected(event: MatAutocompleteSelectedEvent): void {
    const task: ITask | null = event.option.value;
    this.filterTaskId.set(task ? task.id : null);
    this.taskSearchTerm.set(this.displayTaskTitle(task));
    this.page = 1;
    this.load();
  }

  // ---- Employee autocomplete handlers ----
  displayEmployeeName = (employee: IEmployee | null): string =>
    employee ? `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() : '';

  onEmployeeInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.employeeSearchTerm.set(value);
  }

  onEmployeeSelected(event: MatAutocompleteSelectedEvent): void {
    const employee: IEmployee | null = event.option.value;
    this.filterEmployeeId.set(employee ? employee.id : null);
    this.employeeSearchTerm.set(this.displayEmployeeName(employee));
    this.page = 1;
    this.load();
  }

  clearSearch(): void {
    this.filterTaskId.set(null);
    this.taskSearchTerm.set('');
    this.filterEmployeeId.set(null);
    this.employeeSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  delete(timeEntry: ITimeEntry): void {
    const modalRef = this.modalService.open(TimeEntryDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.timeEntry = timeEntry;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(this.page, event);
  }

  navigateToPage(page: number): void {
    this.handleNavigation(page, this.sortState());
  }

  onPageChange(event: PageEvent): void {
    this.navigateToPage(event.pageIndex + 1);
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const page = params.get(PAGE_HEADER);
    this.page = +(page ?? 1);
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.timeEntries.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: ITimeEntry[] | null): ITimeEntry[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    const { page } = this;

    this.isLoading = true;
    const pageToLoad: number = page;
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      eagerload: true,
      sort: this.sortService.buildSortParam(this.sortState()),
    };

    const taskId = this.filterTaskId();
    if (taskId) {
      queryObject['taskId'] = taskId;
    }

    const employeeId = this.filterEmployeeId();
    if (employeeId) {
      queryObject['employeeId'] = employeeId;
    }

    return this.timeEntryService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(page: number, sortState: SortState): void {
    const queryParamsObj = {
      page,
      size: this.itemsPerPage,
      sort: this.sortService.buildSortParam(sortState),
    };

    this.ngZone.run(() => {
      this.router.navigate(['./'], {
        relativeTo: this.activatedRoute,
        queryParams: queryParamsObj,
      });
    });
  }
}
