import { Component, NgZone, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subject, Subscription, combineLatest, filter, tap, debounceTime, distinctUntilChanged } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormatMediumDatePipe } from 'app/shared/date';
import { ItemCountComponent } from 'app/shared/pagination';
import { FormsModule } from '@angular/forms';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { DataUtils } from 'app/core/util/data-util.service';
import { IProject } from '../project.model';
import { ProjectStatus } from 'app/entities/enumerations/project-status.model';

import { IClient } from 'app/entities/client/client.model';
import { ClientService } from 'app/entities/client/service/client.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { EntityArrayResponseType, ProjectService } from '../service/project.service';
import { ProjectDeleteDialogComponent } from '../delete/project-delete-dialog.component';

@Component({
  selector: 'jhi-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    FormatMediumDatePipe,
    ItemCountComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
})
export class ProjectComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  projects = signal<IProject[]>([]);
  isLoading = false;

  // ---- Name filter (debounced text input) ----
  filterName = signal<string>('');
  private readonly filterInput$ = new Subject<string>();
  private filterSubscription: Subscription | null = null;

  // ---- Status filter (dropdown, fixed options) ----
  filterStatus = signal<string>('');
  readonly statusOptions: ProjectStatus[] = [
    ProjectStatus.PLANNED,
    ProjectStatus.ACTIVE,
    ProjectStatus.ON_HOLD,
    ProjectStatus.COMPLETED,
    ProjectStatus.CANCELLED,
  ];

  // ---- Client filter (searchable autocomplete) ----
  filterClientId = signal<number | null>(null);
  clientSearchTerm = signal<string>('');
  clients = signal<IClient[]>([]);
  filteredClients = computed(() => {
    const term = this.clientSearchTerm().toLowerCase().trim();
    if (!term) {
      return this.clients();
    }
    return this.clients().filter(c => (c.companyName ?? '').toLowerCase().includes(term));
  });

  // ---- Manager filter (searchable autocomplete) ----
  filterManagerId = signal<number | null>(null);
  managerSearchTerm = signal<string>('');
  managers = signal<IEmployee[]>([]);
  filteredManagers = computed(() => {
    const term = this.managerSearchTerm().toLowerCase().trim();
    if (!term) {
      return this.managers();
    }
    return this.managers().filter(m => `${m.firstName ?? ''} ${m.lastName ?? ''}`.toLowerCase().includes(term));
  });

  sortState = sortStateSignal({});

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  public readonly router = inject(Router);
  protected readonly projectService = inject(ProjectService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected dataUtils = inject(DataUtils);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly clientService = inject(ClientService);
  protected readonly employeeService = inject(EmployeeService);

  trackId = (item: IProject): number => this.projectService.getProjectIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();

    this.filterSubscription = this.filterInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      this.filterName.set(value);
      this.page = 1;
      this.load();
    });

    this.clientService.query().subscribe(res => this.clients.set(res.body ?? []));
    this.employeeService.query().subscribe(res => this.managers.set(res.body ?? []));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.filterSubscription?.unsubscribe();
  }

  onFilterInput(value: string): void {
    this.filterInput$.next(value);
  }

  onStatusChange(value: string): void {
    this.filterStatus.set(value);
    this.page = 1;
    this.load();
  }

  // ---- Client autocomplete handlers ----
  displayClientName = (client: IClient | null): string => (client ? (client.companyName ?? '') : '');

  onClientInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.clientSearchTerm.set(value);
  }

  onClientSelected(event: MatAutocompleteSelectedEvent): void {
    const client: IClient | null = event.option.value;
    this.filterClientId.set(client ? client.id : null);
    this.page = 1;
    this.load();
  }

  clearClientFilter(): void {
    this.filterClientId.set(null);
    this.clientSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  // ---- Manager autocomplete handlers ----
  displayManagerName = (manager: IEmployee | null): string =>
    manager ? `${manager.firstName ?? ''} ${manager.lastName ?? ''}`.trim() : '';

  onManagerInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.managerSearchTerm.set(value);
  }

  onManagerSelected(event: MatAutocompleteSelectedEvent): void {
    const manager: IEmployee | null = event.option.value;
    this.filterManagerId.set(manager ? manager.id : null);
    this.page = 1;
    this.load();
  }

  clearManagerFilter(): void {
    this.filterManagerId.set(null);
    this.managerSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  clearSearch(): void {
    this.filterName.set('');
    this.filterStatus.set('');
    this.clearClientFilter();
    this.clearManagerFilter();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  delete(project: IProject): void {
    const modalRef = this.modalService.open(ProjectDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.project = project;
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
    this.projects.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: IProject[] | null): IProject[] {
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

    const clientId = this.filterClientId();
    if (clientId) {
      queryObject['clientId'] = clientId;
    }

    const managerId = this.filterManagerId();
    if (managerId) {
      queryObject['managerId'] = managerId;
    }

    return this.projectService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
