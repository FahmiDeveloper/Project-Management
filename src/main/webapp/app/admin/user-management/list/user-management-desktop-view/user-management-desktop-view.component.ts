import { Component, EventEmitter, Input, Output, Signal, ViewChild, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, type SortState } from 'app/shared/sort';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Account } from 'app/core/auth/account.model';
import { User } from '../../user-management.model';

export interface SetActiveEvent {
  user: User;
  isActivated: boolean;
}

@Component({
  selector: 'jhi-user-management-desktop-view',
  templateUrl: './user-management-desktop-view.component.html',
  styleUrls: ['./user-management-desktop-view.component.scss'],
  imports: [
    RouterModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
  ],
})
export class UserManagementDesktopViewComponent {
  @Input({ required: true }) users!: Signal<User[] | null>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;
  @Input({ required: true }) currentAccount!: Signal<Account | null | undefined>;

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() setActive = new EventEmitter<SetActiveEvent>();
  @Output() delete = new EventEmitter<User>();

  displayedColumns: string[] = [
    'id',
    'login',
    'email',
    'activated',
    'langKey',
    'profiles',
    'createdDate',
    'lastModifiedBy',
    'lastModifiedDate',
  ];

  trackIdentity = (item: User): number => item.id!;

  // Right-click context menu (view/edit/delete moved here instead of the always-visible
  // "actions" column), mirroring sprint/department/project/employee-desktop-view. mat-menu
  // has no "open at x/y" API, so the standard approach is a hidden trigger element whose
  // position we move to the cursor, then open it programmatically.
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: 0, y: 0 };

  onRowContextMenu(event: MouseEvent, user: User): void {
    event.preventDefault();
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextMenu.menuData = { user };
    this.contextMenu.menu?.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
}
