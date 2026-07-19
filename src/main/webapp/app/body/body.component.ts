import { ChangeDetectorRef, Component, inject, Input, OnInit, ViewChild, HostListener, OnDestroy, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
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
import { LoginService } from 'app/login/login.service';
import { Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'app-body',
  standalone: true,
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss'],
  imports: [
    CommonModule,
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

  private readonly destroy$ = new Subject<void>();

  private readonly loginService = inject(LoginService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly accountService = inject(AccountService);

  isMobile = false;
  private breakpointSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  // Page header properties
  showPageHeader = true;
  breadcrumbs: BreadcrumbItem[] = [];

  allNotifNotDone: Notification[] = [
    {
      id: '1',
      subject: 'Project Deadline Approaching',
      message: 'E-commerce Platform due in 3 days',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      read: false,
      type: 'deadline',
      color: '#f56565',
    },
    {
      id: '2',
      subject: 'New Team Member',
      message: 'Sarah Johnson joined your project team',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      type: 'team',
      color: '#4299e1',
    },
    {
      id: '3',
      subject: 'Task Completed',
      message: 'Design review passed for mobile app',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
      type: 'task',
      color: '#48bb78',
    },
    {
      id: '4',
      subject: 'Meeting Scheduled',
      message: 'Sprint planning tomorrow at 10:00 AM',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      read: false,
      type: 'meeting',
      color: '#ed8936',
    },
  ];

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
    { icon: 'analytics', text: 'Reports', link: '/report-snapshot' },
    { icon: 'gavel', text: 'Authority', link: '/authority' },
    { icon: 'admin_panel_settings', text: 'User management', link: '/admin/user-management' },
    { icon: 'analytics', text: 'Metrics', link: '/admin/metrics' },
    { icon: 'monitor_heart', text: 'Health', link: '/admin/health' },
    { icon: 'manage_accounts', text: 'Configuration', link: '/admin/configuration' },
    { icon: 'receipt_long', text: 'Logs', link: '/admin/logs' },
    { icon: 'api', text: 'API', link: '/admin/docs' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => this.account.set(account));

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
    return this.sideNavList.slice(4, 15);
  }

  getAnalyticsNav(): SideNavList[] {
    return this.sideNavList.slice(15, 18);
  }

  getAdministrationNav(): SideNavList[] {
    return this.sideNavList.slice(18);
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

  isActiveRoute(link: string): boolean {
    return this.router.url === link || this.router.url.startsWith(link + '/');
  }

  getBadgeCount(item: SideNavList): number {
    if (item.link === '/notification') {
      return this.allNotifNotDone?.filter(n => !n.read).length || 0;
    }
    return 0;
  }

  getTimeAgo(date: string): string {
    if (!date) return 'Just now';
    try {
      const now = new Date();
      const notifDate = new Date(date);
      if (isNaN(notifDate.getTime())) return 'Just now';

      const diff = Math.floor((now.getTime() - notifDate.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
      return notifDate.toLocaleDateString();
    } catch {
      return 'Just now';
    }
  }

  getColor(notification: Notification): string {
    return notification.color || '#667eea';
  }

  getIcon(notification: Notification): string {
    const icons = {
      deadline: 'warning',
      team: 'person_add',
      task: 'check_circle',
      meeting: 'event',
    };
    return icons[notification.type as keyof typeof icons] || 'notifications';
  }

  markAllAsRead() {
    this.allNotifNotDone.forEach(n => (n.read = true));
    this.cdr.detectChanges();
  }

  markAsRead(notification: Notification) {
    notification.read = true;
    this.cdr.detectChanges();
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

export interface Notification {
  id: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: string;
  color: string;
}

export interface BreadcrumbItem {
  label: string;
  link: string;
}
