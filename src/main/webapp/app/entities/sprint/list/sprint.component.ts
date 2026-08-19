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
import { ISprint } from '../sprint.model';
import { SprintStatus } from 'app/entities/enumerations/sprint-status.model';

import { EntityArrayResponseType, SprintService } from '../service/sprint.service';
import { SprintDeleteDialogComponent } from '../delete/sprint-delete-dialog.component';

import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { SprintDesktopViewComponent } from './sprint-desktop-view/sprint-desktop-view.component';
import { SprintMobileViewComponent } from './sprint-mobile-view/sprint-mobile-view.component';

@Component({
  selector: 'jhi-sprint',
  templateUrl: './sprint.component.html',
  styleUrls: ['./sprint.component.scss'],
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
    SprintDesktopViewComponent,
    SprintMobileViewComponent,
  ],
})
export class SprintComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  sprints = signal<ISprint[]>([]);
  isLoading = false;

  // ---- Responsive layout ----
  private readonly breakpointObserver = inject(BreakpointObserver);
  isMobile = toSignal(this.breakpointObserver.observe(['(max-width: 767px)']).pipe(map(result => result.matches)), {
    initialValue: this.breakpointObserver.isMatched('(max-width: 767px)'),
  });

  private readonly statusLabels: Record<string, string> = {
    null: '',
    PLANNED: 'PLANNED',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
  };

  // ---- Name filter (debounced text input) ----
  filterName = signal<string>('');
  private readonly nameInput$ = new Subject<string>();
  private nameSubscription: Subscription | null = null;

  // ---- Status filter (dropdown, fixed options) ----
  filterStatus = signal<string>('');
  readonly statusOptions: SprintStatus[] = [SprintStatus.PLANNED, SprintStatus.ACTIVE, SprintStatus.COMPLETED];

  // ---- Project filter (searchable autocomplete) ----
  filterProjectId = signal<number | null>(null);
  projectSearchTerm = signal<string>('');
  projects = signal<IProject[]>([]);
  filteredProjects = computed(() => {
    const term = this.projectSearchTerm().toLowerCase().trim();
    if (!term) {
      return this.projects();
    }
    return this.projects().filter(p => (p.name ?? '').toLowerCase().includes(term));
  });

  sortState = sortStateSignal({});

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  // Number of currently active filters, shown as a badge on the mobile filter toggle.
  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterName().trim()) count++;
    if (this.filterStatus()) count++;
    if (this.filterProjectId()) count++;
    return count;
  });

  // Arrow property (not a method) so `this` stays bound when passed by reference to child components.
  statusLabel = (status: string | null | undefined): string => this.statusLabels[status ?? 'null'];

  public readonly router = inject(Router);
  protected readonly sprintService = inject(SprintService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected dataUtils = inject(DataUtils);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly projectService = inject(ProjectService);

  trackId = (item: ISprint): number => this.sprintService.getSprintIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();

    this.nameSubscription = this.nameInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      this.filterName.set(value);
      this.page = 1;
      this.load();
    });

    this.projectService.query().subscribe(res => this.projects.set(res.body ?? []));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.nameSubscription?.unsubscribe();
  }

  onNameInput(value: string): void {
    this.nameInput$.next(value);
  }

  onStatusChange(value: string): void {
    this.filterStatus.set(value);
    this.page = 1;
    this.load();
  }

  // ---- Project autocomplete handlers ----
  displayProjectName = (project: IProject | null): string => (project ? (project.name ?? '') : '');

  onProjectInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.projectSearchTerm.set(value);
  }

  onProjectSelected(event: MatAutocompleteSelectedEvent): void {
    const project: IProject | null = event.option.value;
    this.filterProjectId.set(project ? project.id : null);
    this.projectSearchTerm.set(this.displayProjectName(project));
    this.page = 1;
    this.load();
  }

  clearProjectFilter(): void {
    this.filterProjectId.set(null);
    this.projectSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  clearSearch(): void {
    this.filterName.set('');
    this.filterStatus.set('');
    this.filterProjectId.set(null);
    this.projectSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  delete(sprint: ISprint): void {
    const modalRef = this.modalService.open(SprintDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.sprint = sprint;
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
    this.sprints.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: ISprint[] | null): ISprint[] {
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

    const name = this.filterName().trim();
    if (name) {
      queryObject['name'] = name;
    }

    const status = this.filterStatus();
    if (status) {
      queryObject['status'] = status;
    }

    const projectId = this.filterProjectId();
    if (projectId) {
      queryObject['projectId'] = projectId;
    }

    return this.sprintService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
