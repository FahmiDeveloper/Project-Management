import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Account } from 'app/core/auth/account.model';
import { User } from '../../user-management.model';
import { SetActiveEvent } from '../user-management-desktop-view/user-management-desktop-view.component';

@Component({
  selector: 'jhi-user-management-mobile-view',
  templateUrl: './user-management-mobile-view.component.html',
  styleUrls: ['./user-management-mobile-view.component.scss'],
  imports: [RouterModule, SharedModule, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule],
})
export class UserManagementMobileViewComponent {
  @Input({ required: true }) users!: Signal<User[] | null>;
  @Input({ required: true }) currentAccount!: Signal<Account | null | undefined>;

  @Output() setActive = new EventEmitter<SetActiveEvent>();
  @Output() delete = new EventEmitter<User>();
}
