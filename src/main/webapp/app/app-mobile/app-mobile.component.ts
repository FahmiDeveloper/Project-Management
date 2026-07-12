import { ChangeDetectorRef, Component, inject, Input, input, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
// import { AngularFireAuth } from '@angular/fire/auth';
import { Router, RouterOutlet } from '@angular/router';

// import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription } from 'rxjs';
import { LoginService } from 'app/login/login.service';
// import firebase from 'firebase';
// import Swal from 'sweetalert2';

// import { AuthService } from '../shared/services/auth.service';
// import { UsersListService } from '../shared/services/list-users.service';

// import { FirebaseUserModel } from '../shared/models/user.model';
// import { Notification } from 'src/app/shared/models/notification.model';
// import { NotificationService } from '../shared/services/notification.service';

// @UntilDestroy()

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile',
  standalone: true,
  templateUrl: './app-mobile.component.html',
  styleUrls: ['./app-mobile.component.scss'],
  imports: [MatToolbarModule, MatIconModule, MatBadgeModule, MatSidenavModule, MatDividerModule, RouterOutlet, OverlayModule, CommonModule],
})
export class AppMobileComponent implements OnInit {
  @ViewChild(MatSidenav) sidenav!: MatSidenav;

  // user: firebase.User;
  // userName: string;
  // subscriptipn: Subscription;
  // allUsers: FirebaseUserModel[] = [];
  @Input() isConnected = false;

  private readonly loginService = inject(LoginService);
  private readonly cdr = inject(ChangeDetectorRef);

  sideNavList: SideNavList[] = [
    { icon: 'home', text: 'Home', link: '/home' },
    { icon: 'domain', text: 'Departments', link: '/department' },
    { icon: 'groups_3', text: 'Employees', link: '/employee' },
    { icon: 'group_add', text: 'Clients', link: '/client' },
    { icon: 'assignment', text: 'Projects', link: '/project' },
    { icon: 'groups', text: 'Projects members', link: '/project-member' },
    { icon: 'flag', text: 'Milestones', link: '/milestone' },
    { icon: 'fast_forward', text: 'Sprints', link: '/sprint' },
    { icon: 'attach_money', text: 'Tasks', link: '/task' },
    { icon: 'task_alt', text: 'Tasks comments', link: '/task-comment' },
    { icon: 'attach_file', text: 'Attachments', link: '/attachment' },
    { icon: 'playlist_add_check', text: 'Checklists', link: '/checklist' },
    { icon: 'check_box', text: 'Checklists items', link: '/checklist-item' },
    { icon: 'more_time', text: 'Times entries', link: '/time-entry' },
    { icon: 'notifications_none', text: 'Notifications', link: '/notification' },
    { icon: 'history', text: 'Activities logs', link: '/activity-log' },
    { icon: 'insights', text: 'Reports snapshots', link: '/report-snapshot' },
    { icon: 'dashboard', text: 'Dashboards', link: '/dashboard' },
  ];

  allNotifNotDone: Notification[] = [];
  // subscriptionForGetAllNotifNotDone: Subscription;
  isOpenOverlayNotifs = false;

  constructor(
    private observer: BreakpointObserver,
    private router: Router,
    // private afAuth: AngularFireAuth,
    // public authService: AuthService,
    // public usersListService: UsersListService,
    // public notificationService: NotificationService
  ) {}

  ngOnInit() {
    // this.checkIfUserIsConnected();
    // this.getUserData();
    // this.getAllUsers();
    // this.getAllNotificationsNotDone();
  }

  // checkIfUserIsConnected() {
  //   this.authService.isConnected.subscribe(res=>{
  //     this.isConnected=res;
  //   })
  // }

  ngAfterViewInit() {
    this.cdr.detectChanges();
    // this.observer
    //   .observe(['(max-width: 800px)'])
    //   .pipe(delay(1), untilDestroyed(this))
    //   .subscribe((res) => {
    //     if (res.matches) {
    //       this.sidenav.mode = 'over';
    //       this.sidenav.close();
    //     } else {
    //       this.sidenav.mode = 'side';
    //       this.sidenav.open();
    //     }
    //   });

    // this.router.events
    //   .pipe(
    //     untilDestroyed(this),
    //     filter((e) => e instanceof NavigationEnd)
    //   )
    //   .subscribe(() => {
    //     if (this.sidenav.mode === 'over') {
    //       this.sidenav.close();
    //     }
    //   });
  }

  // getUserData() {
  //   this.subscriptipn = this.afAuth
  //     .authState
  //     .subscribe(user => {
  //       this.user = user;
  //       if(this.user && !this.user.displayName) {
  //         this.getNameFromEmail(this.user.email);
  //       }
  //   })
  // }

  // getNameFromEmail(email) {
  //   this.userName = email.substring(0, email.lastIndexOf("@"));
  // }

  // getAllUsers() {
  //   this.usersListService
  //   .getAll()
  //   .subscribe((users: FirebaseUserModel[]) => {
  //     this.allUsers = users;
  //   });
  // }

  // getAllNotificationsNotDone() {
  //   this.subscriptionForGetAllNotifNotDone = this.notificationService
  //   .getAll()
  //   .subscribe((notifications: Notification[]) => {
  //     this.allNotifNotDone = [];
  //     notifications.forEach(notification => {
  //       if (notification.notifSubjectDone == false) {
  //         this.allNotifNotDone.push(notification);
  //       }
  //     })
  //     this.allNotifNotDone = this.allNotifNotDone.sort((n1, n2) => new Date(n2.formatDate).getTime() - new Date(n1.formatDate).getTime()).slice(0, 5);
  //   });
  // }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  // putCurrentUserConnected(email: string) {
  //   let connectedUserFromList: FirebaseUserModel;
  //   connectedUserFromList = this.allUsers.find(user => user.email == email);
  //   connectedUserFromList.isConnected = false;
  //   this.usersListService.update(connectedUserFromList.key, connectedUserFromList);
  // }

  redirectToSideNavContext(sideNavContext: SideNavList) {
    this.router.navigate([sideNavContext.link]);
    this.sidenav.close();
  }

  getTruncatedNameSubject(value: string, limit: number): string {
    if (!value) {
      return '';
    }
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }

  getTimeAgo(notificationDate: string): string {
    const now = new Date();
    const notifDate = new Date(notificationDate);
    const diffInSeconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } else {
      return notifDate.toLocaleDateString(); // Show full date after a week
    }
  }

  markAllAsDoed() {
    // Swal.fire({
    //   title: 'Are you sure?',
    //   text: 'Mark all notifications as doed!',
    //   icon: 'warning',
    //   showCancelButton: true,
    //   confirmButtonText: 'Yes',
    //   cancelButtonText: 'No'
    // }).then((result) => {
    //   if (result.value) {
    //     this.allNotifNotDone.forEach(notif => {
    //       notif.notifSubjectDone = true;
    //       this.notificationService.update(notif.key, notif);
    //     });
    //     Swal.fire(
    //       'Notifications marked as doed successfully',
    //       '',
    //       'success'
    //     )
    //   }
    // })
  }
}

export interface SideNavList {
  icon: string;
  text: string;
  link: string;
}
