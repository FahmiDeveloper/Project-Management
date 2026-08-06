import { Component, HostListener, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { OverlayModule } from '@angular/cdk/overlay';

import { DeviceDetectorService } from 'ngx-device-detector';

import { languages, userItems } from './header-dummy-data';

import { LoginService } from 'app/login/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, MatBadgeModule, OverlayModule],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Input() screenWidth = 0;

  isDesktop = false;
  canShowSearchAsOverlay = false;
  isOpenOverlaySearch = false;
  isOpenOverlayFlags = false;
  isOpenOverlayNotifs = false;
  isOpenOverlayUser = false;
  selectedLanguage: any;

  languages = languages;
  allNotifNotDone: Notification[] = [];
  userItems = userItems;

  private readonly loginService = inject(LoginService);

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkCanShowSearchAsOverlay(window.innerWidth);
  }

  constructor(
    private router: Router,
    public deviceService: DeviceDetectorService,
  ) {}

  ngOnInit() {
    this.isDesktop = this.deviceService.isDesktop();
    this.checkCanShowSearchAsOverlay(window.innerWidth);
    this.selectedLanguage = this.languages[0];
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  getHeadClass(): string {
    let styleClass = '';
    if (this.collapsed && this.screenWidth > 768) {
      styleClass = 'head-trimmed';
    } else {
      styleClass = 'head-md-screen';
    }
    return styleClass;
  }

  checkCanShowSearchAsOverlay(innerWidth: number): void {
    if (innerWidth < 845) {
      this.canShowSearchAsOverlay = true;
    } else {
      this.canShowSearchAsOverlay = false;
    }
  }

  getTruncatedNameSubject(value: string, limit: number): string {
    if (!value) {
      return '';
    }
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }

  markAllAsDoed() {}

  ngOnDestroy() {}
}
