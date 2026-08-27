import { Component, Input, Signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import dayjs from 'dayjs/esm';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { INotification } from '../../notification.model';

interface NotificationGroup {
  label: string;
  items: INotification[];
}

@Component({
  selector: 'jhi-notification-mobile-view',
  templateUrl: './notification-mobile-view.component.html',
  styleUrls: ['./notification-mobile-view.component.scss'],
  imports: [RouterModule, SharedModule, FormatMediumDatetimePipe, MatIconModule, MatTooltipModule],
})
export class NotificationMobileViewComponent {
  @Input({ required: true }) notifications!: Signal<INotification[]>;

  trackGroup = (group: NotificationGroup): string => group.label;

  // Same grouping logic as the desktop feed - "Today" / "Yesterday" / formatted date,
  // preserving arrival order within each group.
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
