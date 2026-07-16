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
import { Chart, registerables } from 'chart.js';

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

  @ViewChild('projectChart') projectChartCanvas!: ElementRef;
  @ViewChild('taskChart') taskChartCanvas!: ElementRef;

  userName = 'Fahmi';
  private projectChartInstance: any;
  private taskChartInstance: any;

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
      assigneeAvatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      title: 'Design system architecture',
      project: 'Mobile App',
      dueDate: 'Tomorrow, 10:00 AM',
      priority: 'medium',
      assigneeAvatar: 'https://i.pravatar.cc/150?img=2',
    },
    {
      title: 'Client meeting preparation',
      project: 'Marketing Website',
      dueDate: 'Jun 25, 2:00 PM',
      priority: 'high',
      assigneeAvatar: 'https://i.pravatar.cc/150?img=3',
    },
    {
      title: 'Update documentation',
      project: 'API Gateway',
      dueDate: 'Jun 26, 11:00 AM',
      priority: 'low',
      assigneeAvatar: 'https://i.pravatar.cc/150?img=4',
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
        'https://i.pravatar.cc/150?img=1',
        'https://i.pravatar.cc/150?img=2',
        'https://i.pravatar.cc/150?img=3',
        'https://i.pravatar.cc/150?img=4',
        'https://i.pravatar.cc/150?img=5',
      ],
    },
    {
      name: 'Mobile App Development',
      description: 'Cross-platform mobile app for project management',
      progress: 45,
      color: '#48bb78',
      tasks: 18,
      members: ['https://i.pravatar.cc/150?img=6', 'https://i.pravatar.cc/150?img=7', 'https://i.pravatar.cc/150?img=8'],
    },
    {
      name: 'API Gateway',
      description: 'Centralized API gateway for microservices communication',
      progress: 90,
      color: '#ed8936',
      tasks: 12,
      members: [
        'https://i.pravatar.cc/150?img=9',
        'https://i.pravatar.cc/150?img=10',
        'https://i.pravatar.cc/150?img=11',
        'https://i.pravatar.cc/150?img=12',
      ],
    },
    {
      name: 'Marketing Website',
      description: 'Company marketing website with CMS integration',
      progress: 30,
      color: '#4299e1',
      tasks: 8,
      members: ['https://i.pravatar.cc/150?img=13', 'https://i.pravatar.cc/150?img=14'],
    },
  ];

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => this.account.set(account));
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createProjectChart();
      this.createTaskChart();
    }, 100);
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

  createNewProject(): void {
    this.router.navigate(['/project/new']);
  }

  viewAllProjects(): void {
    this.router.navigate(['/project']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
