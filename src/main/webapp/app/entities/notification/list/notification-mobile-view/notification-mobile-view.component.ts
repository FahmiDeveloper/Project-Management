import { Component, Input, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { INotification } from '../../notification.model';

@Component({
  selector: 'jhi-notification-mobile-view',
  templateUrl: './notification-mobile-view.component.html',
  styleUrls: ['./notification-mobile-view.component.scss'],
  imports: [RouterModule, SharedModule, FormatMediumDatetimePipe, MatCardModule, MatIconModule, MatTooltipModule],
})
export class NotificationMobileViewComponent {
  @Input({ required: true }) notifications!: Signal<INotification[]>;
}
