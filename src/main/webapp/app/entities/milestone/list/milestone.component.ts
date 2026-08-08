import { Component, NgZone, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subject, Subscription, combineLatest, debounceTime, distinctUntilChanged, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormatMediumDatePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { DataUtils } from 'app/core/util/data-util.service';
import { IMilestone } from '../milestone.model';
import { MilestoneStatus } from 'app/entities/enumerations/milestone-status.model';

import { EntityArrayResponseType, MilestoneService } from '../service/milestone.service';
import { MilestoneDeleteDialogComponent } from '../delete/milestone-delete-dialog.component';

import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'jhi-milestone',
  templateUrl: './milestone.component.html',
  styleUrls: ['./milestone.component.scss'],
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    FormatMediumDatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
})
export class MilestoneComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  milestones = signal<IMilestone[]>([]);
  isLoading = false;

  displayedColumns: string[] = ['title', 'description', 'startDate', 'dueDate', 'status', 'project', 'actions'];

  private readonly statusLabels: Record<string, string> = {
    null: '',
    PLANNED: 'PLANNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  };

  // ---- Title filter (debounced text input) ----
  filterTitle = signal<string>('');
  private readonly titleInput$ = new Subject<string>();
  private titleSubscription: Subscription | null = null;

  // ---- Status filter (dropdown, fixed options) ----
  filterStatus = signal<string>('');
  readonly statusOptions: MilestoneStatus[] = [
    MilestoneStatus.PLANNED,
    MilestoneStatus.IN_PROGRESS,
    MilestoneStatus.COMPLETED,
    MilestoneStatus.CANCELLED,
  ];

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

  public readonly router = inject(Router);
  protected readonly milestoneService = inject(MilestoneService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected dataUtils = inject(DataUtils);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly projectService = inject(ProjectService);

  trackId = (item: IMilestone): number => this.milestoneService.getMilestoneIdentifier(item);

  statusLabel(status: string | null | undefined): string {
    return this.statusLabels[status ?? 'null'];
  }

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

    this.projectService.query().subscribe(res => this.projects.set(res.body ?? []));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.titleSubscription?.unsubscribe();
  }

  onTitleInput(value: string): void {
    this.titleInput$.next(value);
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

  clearSearch(): void {
    this.filterTitle.set('');
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

  delete(milestone: IMilestone): void {
    const modalRef = this.modalService.open(MilestoneDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.milestone = milestone;
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
    this.milestones.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: IMilestone[] | null): IMilestone[] {
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

    const projectId = this.filterProjectId();
    if (projectId) {
      queryObject['projectId'] = projectId;
    }

    return this.milestoneService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
