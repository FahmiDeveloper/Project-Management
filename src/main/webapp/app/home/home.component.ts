import { Component, OnDestroy, OnInit, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { HttpClient } from '@angular/common/http';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [SharedModule, RouterModule, CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatCardModule],
})
export default class HomeComponent implements OnInit, OnDestroy {
  account = signal<Account | null>(null);

  private readonly destroy$ = new Subject<void>();

  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  notificationSent = false;

  private readonly http = inject(HttpClient);

  userName = 'Fahmi';

  // Daily Summary Data
  dailySummary = [
    { icon: 'today', label: 'Tasks Today', value: 8, color: '#667eea', trend: 12 },
    { icon: 'check_circle', label: 'Completed', value: 5, color: '#48bb78', trend: 8 },
    { icon: 'pending', label: 'Pending', value: 3, color: '#ed8936', trend: -5 },
    { icon: 'people', label: 'Active Team', value: 12, color: '#4299e1', trend: 0 },
  ];

  // Project Status Data
  projectStatus = [
    { name: 'E-commerce Platform', count: 24, percentage: 75, color: '#667eea' },
    { name: 'Mobile App Development', count: 18, percentage: 45, color: '#48bb78' },
    { name: 'API Gateway', count: 12, percentage: 90, color: '#ed8936' },
    { name: 'Marketing Website', count: 8, percentage: 30, color: '#4299e1' },
  ];

  // Team Members
  teamMembers = [
    {
      name: 'John Doe',
      role: 'Senior Developer',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=667eea&color=fff&size=40',
      online: true,
      tasks: 5,
    },
    {
      name: 'Jane Smith',
      role: 'UI/UX Designer',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=48bb78&color=fff&size=40',
      online: true,
      tasks: 3,
    },
    {
      name: 'Mike Johnson',
      role: 'Project Manager',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=ed8936&color=fff&size=40',
      online: false,
      tasks: 2,
    },
    {
      name: 'Sarah Wilson',
      role: 'Full Stack Developer',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=4299e1&color=fff&size=40',
      online: true,
      tasks: 4,
    },
    {
      name: 'Tom Brown',
      role: 'QA Engineer',
      avatar: 'https://ui-avatars.com/api/?name=Tom+Brown&background=9f7aea&color=fff&size=40',
      online: false,
      tasks: 2,
    },
  ];

  // Upcoming Deadlines
  upcomingDeadlines = [
    { title: 'Sprint Review Meeting', project: 'E-commerce Platform', day: '15', month: 'Jun', days: 2 },
    { title: 'Design Final Review', project: 'Mobile App', day: '18', month: 'Jun', days: 5 },
    { title: 'Client Presentation', project: 'Marketing Website', day: '22', month: 'Jun', days: 9 },
    { title: 'API Documentation', project: 'API Gateway', day: '25', month: 'Jun', days: 12 },
  ];

  // Achievements
  achievements = [
    {
      icon: 'rocket_launch',
      title: 'Project Launch',
      description: 'Successfully launched E-commerce Platform v1.0',
      date: '2 days ago',
      color: '#667eea',
    },
    {
      icon: 'trending_up',
      title: '100% Growth',
      description: 'Team productivity increased by 100% this quarter',
      date: '1 week ago',
      color: '#48bb78',
    },
    {
      icon: 'groups',
      title: 'Team Milestone',
      description: 'Reached 15 team members across 4 projects',
      date: '2 weeks ago',
      color: '#ed8936',
    },
    {
      icon: 'emoji_events',
      title: 'Best Project Award',
      description: 'Recognized as Best Project of the Month',
      date: '3 weeks ago',
      color: '#f6ad55',
    },
  ];

  // Footer Stats
  footerStats = [
    { icon: 'assignment', value: 24, label: 'Total Projects' },
    { icon: 'task_alt', value: 89, label: 'Tasks Completed' },
    { icon: 'pending', value: 34, label: 'Tasks Pending' },
    { icon: 'people', value: 16, label: 'Team Members' },
    { icon: 'star', value: 4.8, label: 'Rating' },
  ];

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => this.account.set(account));
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  testNotification(): void {
    this.http
      .post(SERVER_API_URL + 'api/push/send', {
        title: 'Hello 👋',
        body: 'This is a test notification from your app! Tap the expand button on the right to read the rest of this extra long message safely inside your status tray.',
        icon: '/content/icons/icon-192x192.png',
        image: 'https://outburst-rocket-provoke.ngrok-free.dev/content/icons/icon-192x192.png',
        url: '/',
      })
      .subscribe({
        next: () => {
          this.notificationSent = true;
          setTimeout(() => (this.notificationSent = false), 3000); // reset after 3s
        },
        error: err => console.error('Notification error:', err),
      });
  }

  getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  getTodayTasksCount(): number {
    return this.dailySummary[0].value;
  }

  startFocusMode(): void {
    // Implement focus mode logic
    console.log('Focus mode started');
  }

  viewTodayTasks(): void {
    this.router.navigate(['/task']);
  }

  viewAllProjects(): void {
    this.router.navigate(['/project']);
  }

  viewAllMembers(): void {
    this.router.navigate(['/employee']);
  }

  viewAllDeadlines(): void {
    this.router.navigate(['/milestone']);
  }

  viewAllAchievements(): void {
    // Navigate to achievements page or show modal
    console.log('View all achievements');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
