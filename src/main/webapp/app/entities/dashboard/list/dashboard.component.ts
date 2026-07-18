import { Component, ElementRef, NgZone, OnInit, ViewChild, inject, signal } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { ItemCountComponent } from 'app/shared/pagination';
import { FormsModule } from '@angular/forms';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { DataUtils } from 'app/core/util/data-util.service';
import { IDashboard } from '../dashboard.model';

import { DashboardService, EntityArrayResponseType } from '../service/dashboard.service';
import { DashboardDeleteDialogComponent } from '../delete/dashboard-delete-dialog.component';
import { Chart, registerables } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'jhi-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [RouterModule, FormsModule, SharedModule, MatIconModule, MatMenuModule, MatButtonModule, MatCardModule],
})

// SortDirective, SortByDirective, FormatMediumDatetimePipe, ItemCountComponent
export class DashboardComponent implements OnInit {
  subscription: Subscription | null = null;
  dashboards = signal<IDashboard[]>([]);
  isLoading = false;

  sortState = sortStateSignal({});

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  @ViewChild('projectChart') projectChartCanvas!: ElementRef;
  @ViewChild('taskChart') taskChartCanvas!: ElementRef;
  private projectChartInstance: any;
  private taskChartInstance: any;

  public readonly router = inject(Router);
  protected readonly dashboardService = inject(DashboardService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected dataUtils = inject(DataUtils);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);

  stats = [
    { icon: 'assignment', label: 'Total Projects', value: 12, color: '#667eea', change: 12 },
    { icon: 'task_alt', label: 'Completed Tasks', value: 48, color: '#48bb78', change: 8 },
    { icon: 'pending', label: 'Pending Tasks', value: 24, color: '#ed8936', change: -3 },
    { icon: 'people', label: 'Team Members', value: 16, color: '#4299e1', change: 5 },
  ];

  recentActivities = [
    { icon: 'assignment', text: 'Project "E-commerce Platform" was created', time: '5 minutes ago', color: '#667eea' },
    { icon: 'task_alt', text: 'Task "Design Database" was completed', time: '1 hour ago', color: '#48bb78' },
    { icon: 'people', text: 'Sarah Johnson joined the team', time: '3 hours ago', color: '#4299e1' },
    { icon: 'comment', text: 'New comment on "Mobile App Design"', time: '5 hours ago', color: '#ed8936' },
    { icon: 'flag', text: 'Milestone "Alpha Release" reached', time: '1 day ago', color: '#9f7aea' },
  ];

  upcomingTasks = [
    {
      title: 'Review project proposal',
      project: 'E-commerce Platform',
      dueDate: 'Today, 5:00 PM',
      priority: 'high',
      assigneeAvatar: 'content/images/avatars/user1.png',
    },
    {
      title: 'Design system architecture',
      project: 'Mobile App',
      dueDate: 'Tomorrow, 10:00 AM',
      priority: 'medium',
      assigneeAvatar: 'content/images/avatars/user2.png',
    },
    {
      title: 'Client meeting preparation',
      project: 'Marketing Website',
      dueDate: 'Jun 25, 2:00 PM',
      priority: 'high',
      assigneeAvatar: 'content/images/avatars/user3.png',
    },
    {
      title: 'Update documentation',
      project: 'API Gateway',
      dueDate: 'Jun 26, 11:00 AM',
      priority: 'low',
      assigneeAvatar: 'content/images/avatars/user4.png',
    },
  ];

  projects = [
    {
      name: 'E-commerce Platform',
      description: 'Building a modern e-commerce platform with microservices architecture',
      progress: 75,
      color: '#667eea',
      tasks: 24,
      members: [
        'content/images/avatars/user1.png',
        'content/images/avatars/user2.png',
        'content/images/avatars/user3.png',
        'content/images/avatars/user4.png',
        'content/images/avatars/user5.png',
      ],
    },
    {
      name: 'Mobile App Development',
      description: 'Cross-platform mobile app for project management',
      progress: 45,
      color: '#48bb78',
      tasks: 18,
      members: ['content/images/avatars/user6.png', 'content/images/avatars/user7.png', 'content/images/avatars/user8.png'],
    },
    {
      name: 'API Gateway',
      description: 'Centralized API gateway for microservices communication',
      progress: 90,
      color: '#ed8936',
      tasks: 12,
      members: [
        'content/images/avatars/user9.png',
        'content/images/avatars/user10.png',
        'content/images/avatars/user11.png',
        'content/images/avatars/user12.png',
      ],
    },
    {
      name: 'Marketing Website',
      description: 'Company marketing website with CMS integration',
      progress: 30,
      color: '#4299e1',
      tasks: 8,
      members: ['content/images/avatars/user13.png', 'content/images/avatars/user14.png'],
    },
  ];

  constructor() {
    Chart.register(...registerables);
  }

  trackId = (item: IDashboard): number => this.dashboardService.getDashboardIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createProjectChart();
      this.createTaskChart();
    }, 100);
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  delete(dashboard: IDashboard): void {
    const modalRef = this.modalService.open(DashboardDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.dashboard = dashboard;
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

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const page = params.get(PAGE_HEADER);
    this.page = +(page ?? 1);
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.dashboards.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: IDashboard[] | null): IDashboard[] {
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
    return this.dashboardService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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

  createProjectChart(): void {
    if (this.projectChartInstance) {
      this.projectChartInstance.destroy();
    }

    const ctx = this.projectChartCanvas.nativeElement.getContext('2d');

    this.projectChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Projects',
            data: [3, 5, 7, 9, 11, 13, 15],
            backgroundColor: 'rgba(102, 126, 234, 0.6)',
            borderColor: '#667eea',
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.04)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  createTaskChart(): void {
    if (this.taskChartInstance) {
      this.taskChartInstance.destroy();
    }

    const ctx = this.taskChartCanvas.nativeElement.getContext('2d');

    this.taskChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Pending', 'Review'],
        datasets: [
          {
            data: [48, 24, 12, 8],
            backgroundColor: ['#48bb78', '#4299e1', '#ed8936', '#9f7aea'],
            borderWidth: 0,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 11,
              },
            },
          },
        },
        cutout: '65%',
      },
    });
  }

  viewAllProjects(): void {
    this.router.navigate(['/project']);
  }

  viewAllTasks(): void {
    this.router.navigate(['/task']);
  }
}
