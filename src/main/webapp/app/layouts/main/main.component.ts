import { Component, OnInit, Renderer2, RendererFactory2, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs/esm';

import { AccountService } from 'app/core/auth/account.service';
import { AppPageTitleStrategy } from 'app/app-page-title-strategy';

import { CustomSwService } from '../../core/service-worker/custom-sw.service';
import { PushSubscriptionService } from '../../core/service-worker/push-subscription.service';
import { PushNotificationService } from '../../core/service-worker/push-notification.service';
import { CommonModule } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { HeaderComponent } from 'app/core/header';
import { BodyComponent } from 'app/body/body.component';
import { AppMobileComponent } from 'app/app-mobile/app-mobile.component';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'jhi-main',
  templateUrl: './main.component.html',
  providers: [AppPageTitleStrategy],
  imports: [CommonModule, SidenavComponent, HeaderComponent, BodyComponent, AppMobileComponent],
})
export default class MainComponent implements OnInit {
  private readonly renderer: Renderer2;
  private readonly router = inject(Router);
  private readonly appPageTitleStrategy = inject(AppPageTitleStrategy);
  private readonly accountService = inject(AccountService);
  private readonly translateService = inject(TranslateService);
  private readonly rootRenderer = inject(RendererFactory2);
  private readonly swService = inject(CustomSwService);
  private readonly pushSubscriptionService = inject(PushSubscriptionService);
  private readonly pushNotificationService = inject(PushNotificationService);
  private readonly deviceService = inject(DeviceDetectorService);

  isSideNavCollapsed = false;
  screenWidth = 0;
  isConnected = false;
  isMobile = false;

  constructor() {
    this.renderer = this.rootRenderer.createRenderer(document.querySelector('html'), null);
  }

  ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();

    // 1. Listen to the continuous authentication state stream
    this.accountService.getAuthenticationState().subscribe(account => {
      if (account) {
        this.isConnected = true;
        this.swService.register();
        this.pushSubscriptionService.subscribe();
        this.pushNotificationService.init();
      } else {
        this.isConnected = false;
      }
      // setInterval(() => {
      //   this.pushNotificationService.sendNotification();
      // }, 10000);
    });

    // try to log in automatically
    this.accountService.identity().subscribe(account => {
      if (!account) {
        // If not logged in, force open the login interface/modal or navigate to the route
        this.router.navigate(['/login']);

        // Note: If you are using JHipster's default LoginService modal instead of a route,
        // you would call this.loginService.login() here instead.
      }
    });

    this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.appPageTitleStrategy.updateTitle(this.router.routerState.snapshot);
      dayjs.locale(langChangeEvent.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', langChangeEvent.lang);
    });
  }

  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }
}
