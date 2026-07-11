import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import FooterComponent from 'app/layouts/footer/footer.component';
import { CommonModule } from '@angular/common';
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
}
