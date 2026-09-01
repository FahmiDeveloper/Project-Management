import { ChangeDetectorRef, Component, computed, inject, Input, OnInit, ViewChild, HostListener, OnDestroy, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BidiModule } from '@angular/cdk/bidi';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs/esm';
import { LoginService } from 'app/login/login.service';
import { Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { DirectionService } from 'app/core/language/direction.service';
import { ThemeService } from 'app/core/theme/theme.service';
import { INotification } from 'app/entities/notification/notification.model';
import { NotificationService } from 'app/entities/notification/service/notification.service';

@Component({
  selector: 'app-body',
  standalone: true,
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss'],
  imports: [
    CommonModule,
    BidiModule,
    MatToolbarModule,
    MatIconModule,
    MatBadgeModule,
    MatSidenavModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    RouterOutlet,
    HasAnyAuthorityDirective,
  ],
})
export class BodyComponent implements OnInit, OnDestroy {
  account = signal<Account | null>(null);
  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  @Input() isConnected = false;

  // Exposed to the template so the root wrapper can carry a live [dir] binding - this is
  // what lets mat-sidenav (position 'start') and CDK overlays (menus, selects) flip sides
  // reactively when the language changes, not just on a full page reload.
  protected readonly direction = inject(DirectionService);

  private readonly destroy$ = new Subject<void>();

  private readonly loginService = inject(LoginService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly accountService = inject(AccountService);
  private readonly notificationService = inject(NotificationService);

  isMobile = false;
  private breakpointSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  // Page header properties
  showPageHeader = true;
  breadcrumbs: BreadcrumbItem[] = [];

  notifications = signal<INotification[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  // Server doesn't send a color per-notification - keeping the same type-based mapping
  // the mock data used. Adjust these keys if your backend's actual `type` values differ
  // from the placeholders the mock used (deadline/team/task/meeting).
  private readonly notifTypeColors: Record<string, string> = {
    deadline: '#f56565',
    team: '#4299e1',
    task: '#48bb78',
    meeting: '#ed8936',
  };

  sideNavList: SideNavList[] = [
    { icon: 'home', text: 'Home', link: '/home' },
    { icon: 'folder_open', text: 'Projects', link: '/project' },
    { icon: 'people', text: 'Employees', link: '/employee' },
    { icon: 'task', text: 'Tasks', link: '/task' },
    { icon: 'flag', text: 'Milestones', link: '/milestone' },
    { icon: 'speed', text: 'Sprints', link: '/sprint' },
    { icon: 'business', text: 'Departments', link: '/department' },
    { icon: 'people_outline', text: 'Clients', link: '/client' },
    { icon: 'group', text: 'Projects Members', link: '/project-member' },
    { icon: 'comment', text: 'Tasks Comments', link: '/task-comment' },
    { icon: 'attach_file', text: 'Attachments', link: '/attachment' },
    { icon: 'checklist', text: 'Checklists', link: '/checklist' },
    { icon: 'check_box', text: 'Checklists Items', link: '/checklist-item' },
    { icon: 'schedule', text: 'Times Entries', link: '/time-entry' },
    { icon: 'notifications', text: 'Notifications', link: '/notification' },
    { icon: 'dashboard', text: 'Dashboard', link: '/dashboard' },
    { icon: 'history', text: 'Activities Logs', link: '/activity-log' },
    { icon: 'analytics', text: 'Reports snapshots', link: '/report-snapshot' },
    { icon: 'gavel', text: 'Authority', link: '/authority' },
    { icon: 'admin_panel_settings', text: 'User management', link: '/admin/user-management' },
    { icon: 'analytics', text: 'Metrics', link: '/admin/metrics' },
    { icon: 'monitor_heart', text: 'Health', link: '/admin/health' },
    { icon: 'manage_accounts', text: 'Configuration', link: '/admin/configuration' },
    { icon: 'receipt_long', text: 'Logs', link: '/admin/logs' },
    { icon: 'api', text: 'API', link: '/admin/docs' },
  ];

  // Injected here (not used directly in this component) purely so its constructor runs
  // on app startup, on every route - it's providedIn: 'root', so Angular only creates
  // it the first time something injects it. Before this, SettingsComponent was the only
  // injector, so refreshing any OTHER page never constructed it, .theme-dark was never
  // applied to <html>, and the page silently fell back to the default light theme even
  // though localStorage still had "dark" saved. BodyComponent renders on every route, so
  // injecting it here guarantees the theme is applied no matter where you refresh.
  private readonly themeService = inject(ThemeService);

  constructor(private router: Router) {}

  ngOnInit() {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => this.account.set(account));

    this.loadNotifications();

    this.breakpointSubscription = this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).subscribe(result => {
      this.isMobile = result.matches;
      if (this.sidenav && this.isConnected) {
        this.sidenav.mode = this.isMobile ? 'over' : 'side';
        // Close sidenav when switching between mobile and desktop
        this.sidenav.close();
      }
    });

    // Close sidenav on navigation (for all devices)
    this.routerSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.closeSidenav();
      this.updateBreadcrumbs();
    });

    // Initial breadcrumb update
    this.updateBreadcrumbs();
  }

  ngAfterViewInit() {
    if (this.sidenav && this.isConnected) {
      // Close sidenav after view initializes
      this.sidenav.close();
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize')
  onResize() {}

  // Centralized method to close sidenav
  private closeSidenav() {
    if (this.sidenav && this.sidenav.opened) {
      this.sidenav.close();
      this.cdr.detectChanges();
    }
  }

  // Update breadcrumbs based on current route
  updateBreadcrumbs() {
    const url = this.router.url;
    const cleanUrl = url.split('?')[0].split('#')[0];
    const segments = cleanUrl.split('/').filter(s => s);

    this.breadcrumbs = [];
    this.breadcrumbs.push({ label: 'Home', link: '/home' });

    let currentPath = '';
    segments.forEach(segment => {
      currentPath += '/' + segment;
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      this.breadcrumbs.push({ label, link: currentPath });
    });
  }

  getMainNav(): SideNavList[] {
    return this.sideNavList.slice(0, 4);
  }

  getManagementNav(): SideNavList[] {
    const managementItems = this.sideNavList.slice(4, 15);

    if (this.isMobile) {
      const desktopOnlyLinks = ['/department', '/client', '/project-member', '/task-comment', '/attachment', '/checklist-item'];
      return managementItems.filter(item => !desktopOnlyLinks.includes(item.link));
    }

    return managementItems;
  }

  getAnalyticsNav(): SideNavList[] {
    return this.sideNavList.slice(15, 18);
  }

  getAdministrationNav(): SideNavList[] {
    const administrationItems = this.sideNavList.slice(18);

    if (this.isMobile) {
      return administrationItems.filter(item => item.link === '/admin/user-management');
    }

    return administrationItems;
  }

  logout() {
    this.closeSidenav();
    this.loginService.logout();
    this.router.navigate(['/login']);
    this.cdr.detectChanges();
  }

  redirectToSideNavContext(item: SideNavList) {
    // Navigate to the route
    this.router.navigate([item.link]);

    // Close sidenav after navigation
    this.closeSidenav();
  }

  goToProfile(): void {
    this.router.navigate(['/account/profile']);
  }

  goToSettings(): void {
    this.router.navigate(['/account/settings']);
  }

  isActiveRoute(link: string): boolean {
    return this.router.url === link || this.router.url.startsWith(link + '/');
  }

  getBadgeCount(item: SideNavList): number {
    if (item.link === '/notification') {
      return this.unreadCount();
    }
    return 0;
  }

  loadNotifications(): void {
    this.notificationService.query({ page: 0, size: 5, sort: ['createdDate,desc'] }).subscribe(res => {
      this.notifications.set(res.body ?? []);
    });
  }

  getTimeAgo(date: dayjs.Dayjs | null | undefined): string {
    if (!date) return 'Just now';
    const diff = dayjs().diff(date, 'second');
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.format('MMM D, YYYY');
  }

  getColor(notification: INotification): string {
    return this.notifTypeColors[notification.type ?? ''] || '#667eea';
  }

  getIcon(notification: INotification): string {
    const icons: Record<string, string> = {
      deadline: 'warning',
      team: 'person_add',
      task: 'check_circle',
      meeting: 'event',
    };
    return icons[notification.type ?? ''] || 'notifications';
  }

  markAllAsRead() {
    const unread = this.notifications().filter(n => !n.isRead);
    unread.forEach(n => {
      this.notificationService.partialUpdate({ id: n.id, isRead: true }).subscribe();
    });
    this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
    this.cdr.detectChanges();
  }

  markAsRead(notification: INotification) {
    if (notification.isRead) {
      return;
    }
    this.notificationService.partialUpdate({ id: notification.id, isRead: true }).subscribe(() => {
      this.notifications.update(list => list.map(n => (n.id === notification.id ? { ...n, isRead: true } : n)));
      this.cdr.detectChanges();
    });
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notification']);
  }
}

export interface SideNavList {
  icon: string;
  text: string;
  link: string;
}

export interface BreadcrumbItem {
  label: string;
  link: string;
}
