import { Component, NgZone, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subject, Subscription, combineLatest, filter, tap, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreakpointObserver } from '@angular/cdk/layout';

import SharedModule from 'app/shared/shared.module';
import { SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormsModule } from '@angular/forms';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { IEmployee } from '../employee.model';
import { EmployeeService, EntityArrayResponseType } from '../service/employee.service';
import { EmployeeDeleteDialogComponent } from '../delete/employee-delete-dialog.component';

import { IDepartment } from 'app/entities/department/department.model';
import { DepartmentService } from 'app/entities/department/service/department.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { EmployeeDesktopViewComponent } from './employee-desktop-view/employee-desktop-view.component';
import { EmployeeMobileViewComponent } from './employee-mobile-view/employee-mobile-view.component';

@Component({
  selector: 'jhi-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
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
    EmployeeDesktopViewComponent,
    EmployeeMobileViewComponent,
  ],
})
export class EmployeeComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  employees = signal<IEmployee[]>([]);
  isLoading = false;

  // ---- Responsive layout ----
  private readonly breakpointObserver = inject(BreakpointObserver);
  isMobile = toSignal(this.breakpointObserver.observe(['(max-width: 767px)']).pipe(map(result => result.matches)), {
    initialValue: this.breakpointObserver.isMatched('(max-width: 767px)'),
  });

  // ---- Name filter (debounced, matches first + last name) ----
  filterName = signal<string>('');
  private readonly nameInput$ = new Subject<string>();
  private nameSubscription: Subscription | null = null;

  // ---- Job Title filter (debounced) ----
  filterJobTitle = signal<string>('');
  private readonly jobTitleInput$ = new Subject<string>();
  private jobTitleSubscription: Subscription | null = null;

  // ---- Department filter (searchable autocomplete) ----
  filterDepartmentId = signal<number | null>(null);
  departmentSearchTerm = signal<string>('');
  departments = signal<IDepartment[]>([]);
  filteredDepartments = computed(() => {
    const term = this.departmentSearchTerm().toLowerCase().trim();
    if (!term) {
      return this.departments();
    }
    return this.departments().filter(d => (d.name ?? '').toLowerCase().includes(term));
  });

  sortState = sortStateSignal({});

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  // Number of currently active filters, shown as a badge on the mobile filter toggle.
  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterName().trim()) count++;
    if (this.filterJobTitle().trim()) count++;
    if (this.filterDepartmentId()) count++;
    return count;
  });

  public readonly router = inject(Router);
  protected readonly employeeService = inject(EmployeeService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly departmentService = inject(DepartmentService);

  trackId = (item: IEmployee): number => this.employeeService.getEmployeeIdentifier(item);

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

    this.jobTitleSubscription = this.jobTitleInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      this.filterJobTitle.set(value);
      this.page = 1;
      this.load();
    });

    this.departmentService.query().subscribe(res => this.departments.set(res.body ?? []));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.nameSubscription?.unsubscribe();
    this.jobTitleSubscription?.unsubscribe();
  }

  onNameInput(value: string): void {
    this.nameInput$.next(value);
  }

  onJobTitleInput(value: string): void {
    this.jobTitleInput$.next(value);
  }

  displayDepartmentName = (department: IDepartment | null): string => (department ? (department.name ?? '') : '');

  onDepartmentSelected(event: MatAutocompleteSelectedEvent): void {
    const department: IDepartment | null = event.option.value;
    this.filterDepartmentId.set(department ? department.id : null);
    this.departmentSearchTerm.set(this.displayDepartmentName(department));
    this.page = 1;
    this.load();
  }

  clearDepartmentFilter(): void {
    this.filterDepartmentId.set(null);
    this.departmentSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  clearSearch(): void {
    this.filterName.set('');
    this.filterJobTitle.set('');
    this.clearDepartmentFilter();
  }

  delete(employee: IEmployee): void {
    const modalRef = this.modalService.open(EmployeeDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.employee = employee;
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
    this.employees.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: IEmployee[] | null): IEmployee[] {
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

    const jobTitle = this.filterJobTitle().trim();
    if (jobTitle) {
      queryObject['jobTitle'] = jobTitle;
    }

    const departmentId = this.filterDepartmentId();
    if (departmentId) {
      queryObject['departmentId'] = departmentId;
    }

    return this.employeeService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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

  onDepartmentInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.departmentSearchTerm.set(value);
  }

  onPageChange(event: PageEvent): void {
    this.navigateToPage(event.pageIndex + 1);
  }
}
