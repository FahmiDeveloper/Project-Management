import { Component, NgZone, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subject, Subscription, combineLatest, debounceTime, distinctUntilChanged, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { DataUtils } from 'app/core/util/data-util.service';
import { ITaskComment } from '../task-comment.model';

import { EntityArrayResponseType, TaskCommentService } from '../service/task-comment.service';
import { TaskCommentDeleteDialogComponent } from '../delete/task-comment-delete-dialog.component';

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
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'jhi-task-comment',
  templateUrl: './task-comment.component.html',
  styleUrls: ['./task-comment.component.scss'],
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    FormatMediumDatetimePipe,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatMenuModule,
  ],
})
export class TaskCommentComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  taskComments = signal<ITaskComment[]>([]);
  isLoading = false;

  displayedColumns: string[] = ['content', 'createdDate', 'task', 'employee'];

  // ---- Content filter (debounced text input) ----
  filterContent = signal<string>('');
  private readonly contentInput$ = new Subject<string>();
  private contentSubscription: Subscription | null = null;

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

  public readonly router = inject(Router);
  protected readonly taskCommentService = inject(TaskCommentService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected dataUtils = inject(DataUtils);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly taskService = inject(TaskService);
  protected readonly employeeService = inject(EmployeeService);

  sortState = sortStateSignal({});

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  // Right-click context menu (view/edit/delete moved here instead of an always-visible
  // "actions" column), mirroring sprint/project/employee/task/milestone/department/client/
  // project-member-desktop-view. mat-menu has no "open at x/y" API, so the standard approach
  // is a hidden trigger element whose position we move to the cursor, then open it programmatically.
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: 0, y: 0 };

  trackId = (item: ITaskComment): number => this.taskCommentService.getTaskCommentIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();

    this.contentSubscription = this.contentInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      this.filterContent.set(value);
      this.page = 1;
      this.load();
    });

    this.taskService.query().subscribe(res => this.tasks.set(res.body ?? []));
    this.employeeService.query().subscribe(res => this.employees.set(res.body ?? []));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.contentSubscription?.unsubscribe();
  }

  onContentInput(value: string): void {
    this.contentInput$.next(value);
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
    this.filterContent.set('');
    this.filterTaskId.set(null);
    this.taskSearchTerm.set('');
    this.filterEmployeeId.set(null);
    this.employeeSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  onRowContextMenu(event: MouseEvent, taskComment: ITaskComment): void {
    event.preventDefault();
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextMenu.menuData = { taskComment };
    this.contextMenu.menu?.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  delete(taskComment: ITaskComment): void {
    const modalRef = this.modalService.open(TaskCommentDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.taskComment = taskComment;
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
    this.taskComments.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: ITaskComment[] | null): ITaskComment[] {
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

    const content = this.filterContent().trim();
    if (content) {
      queryObject['content'] = content;
    }

    const taskId = this.filterTaskId();
    if (taskId) {
      queryObject['taskId'] = taskId;
    }

    const employeeId = this.filterEmployeeId();
    if (employeeId) {
      queryObject['employeeId'] = employeeId;
    }

    return this.taskCommentService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
