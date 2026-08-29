import { Component, EventEmitter, Input, Output, Signal, WritableSignal, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import dayjs from 'dayjs/esm';

import SharedModule from 'app/shared/shared.module';
import { type SortState } from 'app/shared/sort';
import { FormatMediumDatetimePipe } from 'app/shared/date';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { INotification } from '../../notification.model';
import { NotificationService } from '../../service/notification.service';

interface NotificationGroup {
  label: string;
  items: INotification[];
}

@Component({
  selector: 'jhi-notification-desktop-view',
  templateUrl: './notification-desktop-view.component.html',
  styleUrls: ['./notification-desktop-view.component.scss'],
  imports: [RouterModule, SharedModule, FormatMediumDatetimePipe, MatIconModule, MatTooltipModule],
})
export class NotificationDesktopViewComponent {
  @Input({ required: true }) notifications!: Signal<INotification[]>;
  @Input({ required: true }) sortStateSignal!: WritableSignal<SortState>;

  @Output() sortChange = new EventEmitter<SortState>();

  protected readonly notificationService = inject(NotificationService);

  trackId = (item: INotification): number => this.notificationService.getNotificationIdentifier(item);
  trackGroup = (group: NotificationGroup): string => group.label;

  // Groups notifications under "Today" / "Yesterday" / a formatted date header,
  // preserving the order they arrived in (assumed already sorted by the backend query).
  groupedNotifications = computed<NotificationGroup[]>(() => {
    const groups: NotificationGroup[] = [];
    const indexByLabel = new Map<string, number>();

    for (const notification of this.notifications()) {
      const label = this.getDateLabel(notification.createdDate);
      let index = indexByLabel.get(label);
      if (index === undefined) {
        index = groups.length;
        indexByLabel.set(label, index);
        groups.push({ label, items: [] });
      }
      groups[index].items.push(notification);
    }

    return groups;
  });

  private getDateLabel(date: dayjs.Dayjs | null | undefined): string {
    if (!date) {
      return 'Earlier';
    }
    const d = dayjs(date);
    const today = dayjs();
    if (d.isSame(today, 'day')) {
      return 'Today';
    }
    if (d.isSame(today.subtract(1, 'day'), 'day')) {
      return 'Yesterday';
    }
    return d.format('MMMM D, YYYY');
  }

  getEmployeeAvatar(notification: INotification): string | null {
    return notification.employee?.user?.imageUrl ?? null;
  }

  getEmployeeInitials(notification: INotification): string {
    const first = notification.employee?.firstName?.charAt(0) ?? '';
    const last = notification.employee?.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || '?';
  }
}
