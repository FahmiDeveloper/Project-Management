import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subject, Subscription, combineLatest, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreakpointObserver } from '@angular/cdk/layout';

import SharedModule from 'app/shared/shared.module';
import { SortService, SortState, sortStateSignal } from 'app/shared/sort';
import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { SORT } from 'app/config/navigation.constants';
import { AccountService } from 'app/core/auth/account.service';
import { UserManagementService } from '../service/user-management.service';
import { User } from '../user-management.model';
import UserManagementDeleteDialogComponent from '../delete/user-management-delete-dialog.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { SetActiveEvent, UserManagementDesktopViewComponent } from './user-management-desktop-view/user-management-desktop-view.component';
import { UserManagementMobileViewComponent } from './user-management-mobile-view/user-management-mobile-view.component';

@Component({
  selector: 'jhi-user-mgmt',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  imports: [
    RouterModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatExpansionModule,
    FormsModule,
    UserManagementDesktopViewComponent,
    UserManagementMobileViewComponent,
  ],
})
export default class UserManagementComponent implements OnInit, OnDestroy {
  currentAccount = inject(AccountService).trackCurrentAccount();
  users = signal<User[] | null>(null);
  isLoading = signal(false);
  totalItems = signal(0);
  itemsPerPage = ITEMS_PER_PAGE;
  page!: number;
  sortState = sortStateSignal({});

  // ---- Responsive layout ----
  private readonly breakpointObserver = inject(BreakpointObserver);
  isMobile = toSignal(this.breakpointObserver.observe(['(max-width: 767px)']).pipe(map(result => result.matches)), {
    initialValue: this.breakpointObserver.isMatched('(max-width: 767px)'),
  });

  // ---- Login filter (debounced text input) ----
  filterLogin = signal<string>('');
  private readonly loginInput$ = new Subject<string>();
  private loginSubscription: Subscription | null = null;

  // ---- Email filter (debounced text input) ----
  filterEmail = signal<string>('');
  private readonly emailInput$ = new Subject<string>();
  private emailSubscription: Subscription | null = null;

  // Number of currently active filters, shown as a badge on the mobile filter toggle.
  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterLogin().trim()) count++;
    if (this.filterEmail().trim()) count++;
    return count;
  });

  private readonly userService = inject(UserManagementService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sortService = inject(SortService);
  private readonly modalService = inject(NgbModal);

  ngOnInit(): void {
    this.handleNavigation();

    this.loginSubscription = this.loginInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      this.filterLogin.set(value);
      this.page = 1;
      this.loadAll();
    });

    this.emailSubscription = this.emailInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      this.filterEmail.set(value);
      this.page = 1;
      this.loadAll();
    });
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
    this.emailSubscription?.unsubscribe();
  }

  onLoginInput(value: string): void {
    this.loginInput$.next(value);
  }

  onEmailInput(value: string): void {
    this.emailInput$.next(value);
  }

  clearSearch(): void {
    this.filterLogin.set('');
    this.filterEmail.set('');
    this.page = 1;
    this.loadAll();
  }

  onSetActive(event: SetActiveEvent): void {
    this.setActive(event.user, event.isActivated);
  }

  setActive(user: User, isActivated: boolean): void {
    this.userService.update({ ...user, activated: isActivated }).subscribe(() => this.loadAll());
  }

  trackIdentity(item: User): number {
    return item.id!;
  }

  deleteUser(user: User): void {
    const modalRef = this.modalService.open(UserManagementDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.user = user;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }

  loadAll(): void {
    this.isLoading.set(true);

    const queryObject: any = {
      page: this.page - 1,
      size: this.itemsPerPage,
      sort: this.sortService.buildSortParam(this.sortState(), 'id'),
    };

    const login = this.filterLogin().trim();
    if (login) {
      queryObject['login'] = login;
    }

    const email = this.filterEmail().trim();
    if (email) {
      queryObject['email'] = email;
    }

    this.userService.query(queryObject).subscribe({
      next: (res: HttpResponse<User[]>) => {
        this.isLoading.set(false);
        this.onSuccess(res.body, res.headers);
      },
      error: () => this.isLoading.set(false),
    });
  }

  transition(sortState?: SortState): void {
    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute.parent,
      queryParams: {
        page: this.page,
        sort: this.sortService.buildSortParam(sortState ?? this.sortState()),
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.transition();
  }

  private handleNavigation(): void {
    combineLatest([this.activatedRoute.data, this.activatedRoute.queryParamMap]).subscribe(([data, params]) => {
      const page = params.get('page');
      this.page = +(page ?? 1);
      this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data.defaultSort));
      this.loadAll();
    });
  }

  private onSuccess(users: User[] | null, headers: HttpHeaders): void {
    this.totalItems.set(Number(headers.get('X-Total-Count')));
    this.users.set(users);
  }
}
