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
import { IChecklist } from '../checklist.model';
import { ChecklistService, EntityArrayResponseType } from '../service/checklist.service';
import { ChecklistDeleteDialogComponent } from '../delete/checklist-delete-dialog.component';

import { ITask } from 'app/entities/task/task.model';
import { TaskService } from 'app/entities/task/service/task.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';

import { ChecklistDesktopViewComponent } from './checklist-desktop-view/checklist-desktop-view.component';
import { ChecklistMobileViewComponent } from './checklist-mobile-view/checklist-mobile-view.component';

@Component({
  selector: 'jhi-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss'],
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatExpansionModule,
    ChecklistDesktopViewComponent,
    ChecklistMobileViewComponent,
  ],
})
export class ChecklistComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  checklists = signal<IChecklist[]>([]);
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

  sortState = sortStateSignal({});

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  // Number of currently active filters, shown as a badge on the mobile filter toggle.
  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterTitle().trim()) count++;
    if (this.filterTaskId()) count++;
    return count;
  });

  public readonly router = inject(Router);
  protected readonly checklistService = inject(ChecklistService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly taskService = inject(TaskService);

  trackId = (item: IChecklist): number => this.checklistService.getChecklistIdentifier(item);

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

    this.taskService.query().subscribe(res => this.tasks.set(res.body ?? []));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.titleSubscription?.unsubscribe();
  }

  onTitleInput(value: string): void {
    this.titleInput$.next(value);
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

  clearTaskFilter(): void {
    this.filterTaskId.set(null);
    this.taskSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  clearSearch(): void {
    this.filterTitle.set('');
    this.filterTaskId.set(null);
    this.taskSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  delete(checklist: IChecklist): void {
    const modalRef = this.modalService.open(ChecklistDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.checklist = checklist;
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
    this.checklists.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: IChecklist[] | null): IChecklist[] {
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

    const taskId = this.filterTaskId();
    if (taskId) {
      queryObject['taskId'] = taskId;
    }

    return this.checklistService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
