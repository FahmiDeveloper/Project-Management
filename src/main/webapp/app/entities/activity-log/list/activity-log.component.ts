import { Component, NgZone, OnInit, computed, inject, signal } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { IActivityLog } from '../activity-log.model';
import { ActivityLogService, EntityArrayResponseType } from '../service/activity-log.service';
import { ActivityLogDeleteDialogComponent } from '../delete/activity-log-delete-dialog.component';

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
  selector: 'jhi-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss'],
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
  ],
})
export class ActivityLogComponent implements OnInit {
  subscription: Subscription | null = null;
  activityLogs = signal<IActivityLog[]>([]);
  isLoading = false;

  displayedColumns: string[] = ['action', 'entityName', 'entityId', 'description', 'createdDate', 'employee', 'actions'];

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
  protected readonly activityLogService = inject(ActivityLogService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly employeeService = inject(EmployeeService);

  trackId = (item: IActivityLog): number => this.activityLogService.getActivityLogIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();

    this.employeeService.query().subscribe(res => this.employees.set(res.body ?? []));
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
    this.filterEmployeeId.set(null);
    this.employeeSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  delete(activityLog: IActivityLog): void {
    const modalRef = this.modalService.open(ActivityLogDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.activityLog = activityLog;
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
    this.activityLogs.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: IActivityLog[] | null): IActivityLog[] {
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

    const employeeId = this.filterEmployeeId();
    if (employeeId) {
      queryObject['employeeId'] = employeeId;
    }

    return this.activityLogService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
