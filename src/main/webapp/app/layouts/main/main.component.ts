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
import { BodyComponent } from 'app/body/body.component';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'jhi-main',
  templateUrl: './main.component.html',
  providers: [AppPageTitleStrategy],
  imports: [CommonModule, BodyComponent],
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

  // Pages that must stay reachable with NO account/token at all. This used to be handled
  // implicitly - nothing forced a redirect for these because they simply don't have a
  // canActivate guard - but the old "if (!account) navigate(['/login'])" below fired on
  // EVERY route regardless of guards, so it force-redirected these too. Restoring that
  // redirect (needed because protected routes like /home, /project, etc. apparently don't
  // have their own canActivate guard yet - they were relying entirely on this) has to skip
  // this whitelist or we're back to breaking the reset-password/login/register pages.
  //
  // TODO(longer-term, more correct fix): add UserRouteAccessService (or equivalent)
  // canActivate guards directly on the protected routes themselves, the standard JHipster
  // way. Once every protected route guards itself, this whitelist-based redirect here can
  // be removed entirely instead of maintained in two places.
  private readonly publicRoutePrefixes = ['/login', '/account/register', '/account/activate', '/account/reset', '/account/verify-code'];

  constructor() {
    this.renderer = this.rootRenderer.createRenderer(document.querySelector('html'), null);
  }

  ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();

    this.accountService.getAuthenticationState().subscribe(account => {
      if (account) {
        this.isConnected = true;
        this.swService.register();
        this.pushSubscriptionService.subscribe();
        this.pushNotificationService.init();
      } else {
        this.isConnected = false;
      }
    });

    // try to log in automatically
    this.accountService.identity().subscribe(account => {
      if (!account && !this.isPublicRoute(this.router.url)) {
        this.router.navigate(['/login']);
      }
      // NOTE: do NOT add a router.url === '/' check here to redirect to /home.
      // On cold reload, this.router.url can still report '/' while a guard-driven
      // navigation to a deep-linked route (e.g. /account/settings) is in flight,
      // causing this to hijack that navigation. The '' -> 'home' redirect in
      // app.routes.ts already handles the root-path case safely at the router level.
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

  private isPublicRoute(url: string): boolean {
    const path = url.split('?')[0];
    return this.publicRoutePrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
  }
}
