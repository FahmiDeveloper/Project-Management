import { Component, EventEmitter, Input, Output, Signal, WritableSignal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, type SortState } from 'app/shared/sort';
import { FormatMediumDatetimePipe } from 'app/shared/date';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { INotification } from '../../notification.model';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'jhi-notification-desktop-view',
  templateUrl: './notification-desktop-view.component.html',
  styleUrls: ['./notification-desktop-view.component.scss'],
  imports: [
    RouterModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    FormatMediumDatetimePipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class NotificationDesktopViewComponent {
  @Input({ required: true }) notifications!: Signal<INotification[]>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;

  @Output() sortChange = new EventEmitter<SortState>();

  displayedColumns: string[] = ['title', 'message', 'type', 'isRead', 'createdDate', 'employee'];

  protected readonly notificationService = inject(NotificationService);

  trackId = (item: INotification): number => this.notificationService.getNotificationIdentifier(item);
}
