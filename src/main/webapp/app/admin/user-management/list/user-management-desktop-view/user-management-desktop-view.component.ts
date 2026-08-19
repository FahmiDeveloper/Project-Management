import { Component, EventEmitter, Input, Output, Signal, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';

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
  imports: [RouterModule, SharedModule, SortDirective, SortByDirective, MatTableModule, MatIconModule, MatButtonModule, MatTooltipModule],
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
    'actions',
  ];

  trackIdentity = (item: User): number => item.id!;
}
