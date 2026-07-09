import { Component, inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import FooterComponent from 'app/layouts/footer/footer.component';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import PageRibbonComponent from 'app/layouts/profiles/page-ribbon.component';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss'],
  imports: [RouterOutlet, PageRibbonComponent, FooterComponent, CommonModule],
})
export class BodyComponent implements OnInit {
  @Input() collapsed = false;
  @Input() screenWidth = 0;
  @Input() isConnected = false;

  notificationSent = false;

  private readonly http = inject(HttpClient);

  isInitialDashboardLoad = true;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    // If the user goes from disconnected to connected, reset the initial load flag
    if (changes['isConnected'] && changes['isConnected'].currentValue === true) {
      this.isInitialDashboardLoad = true;

      // Turn off the initial load flag right after the view renders so subsequent sidebar toggles remain animated
      setTimeout(() => {
        this.isInitialDashboardLoad = false;
      }, 100);
    }
  }

  ngOnInit(): void {}

  getBodyClass(): string {
    if (!this.isConnected) {
      return 'body-login';
    }

    // Base dashboard layout class
    let styleClass = 'body-dashboard';

    // If it's the very first render on login, kill all animations instantly
    if (this.isInitialDashboardLoad) {
      styleClass += ' no-transition';
    }

    // Apply your responsive sidebar states
    if (this.collapsed && this.screenWidth > 768) {
      styleClass += ' body-trimmed';
    } else if (this.collapsed && this.screenWidth <= 768 && this.screenWidth > 0) {
      styleClass += ' body-md-screen';
    }

    return styleClass;
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
}
