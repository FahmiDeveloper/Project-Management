import { Component, NgZone, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subject, Subscription, combineLatest, debounceTime, distinctUntilChanged, filter, tap, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreakpointObserver } from '@angular/cdk/layout';

import SharedModule from 'app/shared/shared.module';
import { SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormsModule } from '@angular/forms';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { DataUtils } from 'app/core/util/data-util.service';
import { ITask } from '../task.model';
import { TaskStatus } from 'app/entities/enumerations/task-status.model';
import { TaskPriority } from 'app/entities/enumerations/task-priority.model';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ISprint } from 'app/entities/sprint/sprint.model';
import { SprintService } from 'app/entities/sprint/service/sprint.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';

import { EntityArrayResponseType, TaskService } from '../service/task.service';
import { TaskDeleteDialogComponent } from '../delete/task-delete-dialog.component';
import { TaskDesktopViewComponent } from './task-desktop-view/task-desktop-view.component';
import { TaskMobileViewComponent } from './task-mobile-view/task-mobile-view.component';

@Component({
  selector: 'jhi-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatExpansionModule,
    TaskDesktopViewComponent,
    TaskMobileViewComponent,
  ],
})
export class TaskComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  tasks = signal<ITask[]>([]);
  isLoading = false;

  // ---- Responsive layout ----
  private readonly breakpointObserver = inject(BreakpointObserver);
  isMobile = toSignal(this.breakpointObserver.observe(['(max-width: 767px)']).pipe(map(result => result.matches)), {
    initialValue: this.breakpointObserver.isMatched('(max-width: 767px)'),
  });

  // ---- Title filter (debounced text input) ----
  filterTitle = signal<string>('');
  private readonly titleInput$ = new Subject<string>();
  private titleSubscription: Subscription | null = null;

  // ---- Status filter (dropdown, fixed options) ----
  filterStatus = signal<string>('');
  readonly statusOptions: TaskStatus[] = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.TESTING,
    TaskStatus.DONE,
    TaskStatus.BLOCKED,
  ];

  private readonly statusLabels: Record<string, string> = {
    null: '',
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    IN_REVIEW: 'IN_REVIEW',
    TESTING: 'TESTING',
    DONE: 'DONE',
    BLOCKED: 'BLOCKED',
  };

  private readonly priorityLabels: Record<string, string> = {
    null: '',
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
  };

  // ---- Priority filter (dropdown, fixed options) ----
  filterPriority = signal<string>('');
  readonly priorityOptions: TaskPriority[] = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.CRITICAL];

  // ---- Assigned To filter (searchable autocomplete) ----
  filterAssignedToId = signal<number | null>(null);
  assignedToSearchTerm = signal<string>('');
  employees = signal<IEmployee[]>([]);
  filteredEmployees = computed(() => {
    const term = this.assignedToSearchTerm().toLowerCase().trim();
    if (!term) {
      return this.employees();
    }
    return this.employees().filter(e => `${e.firstName ?? ''} ${e.lastName ?? ''}`.toLowerCase().includes(term));
  });

  // ---- Sprint filter (searchable autocomplete) ----
  filterSprintId = signal<number | null>(null);
  sprintSearchTerm = signal<string>('');
  sprints = signal<ISprint[]>([]);
  filteredSprints = computed(() => {
    const term = this.sprintSearchTerm().toLowerCase().trim();
    if (!term) {
      return this.sprints();
    }
    return this.sprints().filter(s => (s.name ?? '').toLowerCase().includes(term));
  });

  // ---- Created By filter (searchable autocomplete, reuses employees list) ----
  filterCreatedById = signal<number | null>(null);
  createdBySearchTerm = signal<string>('');
  filteredCreatedByEmployees = computed(() => {
    const term = this.createdBySearchTerm().toLowerCase().trim();
    if (!term) {
      return this.employees();
    }
    return this.employees().filter(e => `${e.firstName ?? ''} ${e.lastName ?? ''}`.toLowerCase().includes(term));
  });

  sortState = sortStateSignal({});

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  // Number of currently active filters, shown as a badge on the mobile filter toggle.
  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterTitle().trim()) count++;
    if (this.filterStatus()) count++;
    if (this.filterPriority()) count++;
    if (this.filterAssignedToId()) count++;
    if (this.filterSprintId()) count++;
    if (this.filterCreatedById()) count++;
    return count;
  });

  // Arrow properties (not methods) so `this` stays bound when passed by reference to child components.
  statusLabel = (status: string | null | undefined): string => this.statusLabels[status ?? 'null'];
  priorityLabel = (priority: string | null | undefined): string => this.priorityLabels[priority ?? 'null'];

  public readonly router = inject(Router);
  protected readonly taskService = inject(TaskService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected dataUtils = inject(DataUtils);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly employeeService = inject(EmployeeService);
  protected readonly sprintService = inject(SprintService);

  trackId = (item: ITask): number => this.taskService.getTaskIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();

    this.titleSubscription = this.titleInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      this.filterTitle.set(value);
      this.page = 1;
      this.load();
    });

    this.employeeService.query().subscribe(res => this.employees.set(res.body ?? []));
    this.sprintService.query().subscribe(res => this.sprints.set(res.body ?? []));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.titleSubscription?.unsubscribe();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  onStatusChange(value: string): void {
    this.filterStatus.set(value);
    this.page = 1;
    this.load();
  }

  onPriorityChange(value: string): void {
    this.filterPriority.set(value);
    this.page = 1;
    this.load();
  }

  onTitleInput(value: string): void {
    this.titleInput$.next(value);
  }

  // ---- Created By autocomplete handlers ----
  onCreatedByInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.createdBySearchTerm.set(value);
  }

  onCreatedBySelected(event: MatAutocompleteSelectedEvent): void {
    const employee: IEmployee | null = event.option.value;
    this.filterCreatedById.set(employee ? employee.id : null);
    this.createdBySearchTerm.set(this.displayEmployeeName(employee));
    this.page = 1;
    this.load();
  }

  clearCreatedByFilter(): void {
    this.filterCreatedById.set(null);
    this.createdBySearchTerm.set('');
    this.page = 1;
    this.load();
  }

  // ---- Assigned To autocomplete handlers ----
  displayEmployeeName = (employee: IEmployee | null): string =>
    employee ? `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() : '';

  onAssignedToInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.assignedToSearchTerm.set(value);
  }

  onAssignedToSelected(event: MatAutocompleteSelectedEvent): void {
    const employee: IEmployee | null = event.option.value;
    this.filterAssignedToId.set(employee ? employee.id : null);
    this.assignedToSearchTerm.set(this.displayEmployeeName(employee));
    this.page = 1;
    this.load();
  }

  clearAssignedToFilter(): void {
    this.filterAssignedToId.set(null);
    this.assignedToSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  // ---- Sprint autocomplete handlers ----
  displaySprintName = (sprint: ISprint | null): string => (sprint ? (sprint.name ?? '') : '');

  onSprintInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.sprintSearchTerm.set(value);
  }

  onSprintSelected(event: MatAutocompleteSelectedEvent): void {
    const sprint: ISprint | null = event.option.value;
    this.filterSprintId.set(sprint ? sprint.id : null);
    this.sprintSearchTerm.set(this.displaySprintName(sprint));
    this.page = 1;
    this.load();
  }

  clearSprintFilter(): void {
    this.filterSprintId.set(null);
    this.sprintSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  clearSearch(): void {
    this.filterTitle.set('');
    this.filterStatus.set('');
    this.filterPriority.set('');
    this.filterAssignedToId.set(null);
    this.assignedToSearchTerm.set('');
    this.filterSprintId.set(null);
    this.sprintSearchTerm.set('');
    this.filterCreatedById.set(null);
    this.createdBySearchTerm.set('');
    this.page = 1;
    this.load();
  }

  delete(task: ITask): void {
    const modalRef = this.modalService.open(TaskDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.task = task;
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

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const page = params.get(PAGE_HEADER);
    this.page = +(page ?? 1);
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.tasks.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: ITask[] | null): ITask[] {
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

    const title = this.filterTitle().trim();
    if (title) {
      queryObject['title'] = title;
    }

    const status = this.filterStatus();
    if (status) {
      queryObject['status'] = status;
    }

    const priority = this.filterPriority();
    if (priority) {
      queryObject['priority'] = priority;
    }

    const assignedToId = this.filterAssignedToId();
    if (assignedToId) {
      queryObject['assignedToId'] = assignedToId;
    }

    const sprintId = this.filterSprintId();
    if (sprintId) {
      queryObject['sprintId'] = sprintId;
    }

    const createdById = this.filterCreatedById();
    if (createdById) {
      queryObject['createdById'] = createdById;
    }

    return this.taskService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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

  onPageChange(event: PageEvent): void {
    this.navigateToPage(event.pageIndex + 1);
  }
}
