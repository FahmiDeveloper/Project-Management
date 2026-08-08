import { Component, NgZone, OnInit, computed, inject, signal } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormatMediumDatePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { IProjectMember } from '../project-member.model';
import { EntityArrayResponseType, ProjectMemberService } from '../service/project-member.service';
import { ProjectMemberDeleteDialogComponent } from '../delete/project-member-delete-dialog.component';

import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';
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
  selector: 'jhi-project-member',
  templateUrl: './project-member.component.html',
  styleUrls: ['./project-member.component.scss'],
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
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
})
export class ProjectMemberComponent implements OnInit {
  subscription: Subscription | null = null;
  projectMembers = signal<IProjectMember[]>([]);
  isLoading = false;

  displayedColumns: string[] = ['role', 'joinedDate', 'active', 'project', 'employee', 'actions'];

  private readonly roleLabels: Record<string, string> = {
    null: '',
    PROJECT_MANAGER: 'PROJECT_MANAGER',
    TEAM_LEAD: 'TEAM_LEAD',
    DEVELOPER: 'DEVELOPER',
    TESTER: 'TESTER',
    DESIGNER: 'DESIGNER',
    BUSINESS_ANALYST: 'BUSINESS_ANALYST',
  };

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
  protected readonly projectMemberService = inject(ProjectMemberService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly projectService = inject(ProjectService);
  protected readonly employeeService = inject(EmployeeService);

  trackId = (item: IProjectMember): number => this.projectMemberService.getProjectMemberIdentifier(item);

  roleLabel(role: string | null | undefined): string {
    return this.roleLabels[role ?? 'null'];
  }

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();

    this.projectService.query().subscribe(res => this.projects.set(res.body ?? []));
    this.employeeService.query().subscribe(res => this.employees.set(res.body ?? []));
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
    this.filterProjectId.set(null);
    this.projectSearchTerm.set('');
    this.filterEmployeeId.set(null);
    this.employeeSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  delete(projectMember: IProjectMember): void {
    const modalRef = this.modalService.open(ProjectMemberDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.projectMember = projectMember;
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
    this.projectMembers.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: IProjectMember[] | null): IProjectMember[] {
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

    const projectId = this.filterProjectId();
    if (projectId) {
      queryObject['projectId'] = projectId;
    }

    const employeeId = this.filterEmployeeId();
    if (employeeId) {
      queryObject['employeeId'] = employeeId;
    }

    return this.projectMemberService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
