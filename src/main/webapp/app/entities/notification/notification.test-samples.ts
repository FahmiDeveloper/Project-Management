import dayjs from 'dayjs/esm';

import { INotification, NewNotification } from './notification.model';

export const sampleWithRequiredData: INotification = {
  id: 10110,
  title: 'reclassify makeover',
  message: 'muscat',
  type: 'gah',
  isRead: false,
  createdDate: dayjs('2026-06-30T11:24'),
};

export const sampleWithPartialData: INotification = {
  id: 27987,
  title: 'despite anesthetize because',
  message: 'ack',
  type: 'usher tragic interesting',
  isRead: true,
  createdDate: dayjs('2026-06-30T05:41'),
};

export const sampleWithFullData: INotification = {
  id: 5787,
  title: 'some extra-large',
  message: 'bruised',
  type: 'arid gust',
  isRead: true,
  createdDate: dayjs('2026-06-30T17:18'),
};

export const sampleWithNewData: NewNotification = {
  title: 'consequently voluntarily ew',
  message: 'honesty depart acquaintance',
  type: 'aw save yuck',
  isRead: true,
  createdDate: dayjs('2026-06-29T23:45'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
