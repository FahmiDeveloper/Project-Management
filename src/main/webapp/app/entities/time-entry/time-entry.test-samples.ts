import dayjs from 'dayjs/esm';

import { ITimeEntry, NewTimeEntry } from './time-entry.model';

export const sampleWithRequiredData: ITimeEntry = {
  id: 7308,
  startTime: dayjs('2026-06-30T02:09'),
  endTime: dayjs('2026-06-30T13:16'),
  hours: 29706.16,
  entryDate: dayjs('2026-06-30'),
};

export const sampleWithPartialData: ITimeEntry = {
  id: 7579,
  startTime: dayjs('2026-06-29T19:43'),
  endTime: dayjs('2026-06-30T08:45'),
  hours: 24464.51,
  entryDate: dayjs('2026-06-30'),
};

export const sampleWithFullData: ITimeEntry = {
  id: 31808,
  description: 'promptly atop',
  startTime: dayjs('2026-06-29T21:38'),
  endTime: dayjs('2026-06-29T18:04'),
  hours: 32331.97,
  entryDate: dayjs('2026-06-30'),
};

export const sampleWithNewData: NewTimeEntry = {
  startTime: dayjs('2026-06-30T09:28'),
  endTime: dayjs('2026-06-29T23:28'),
  hours: 30728.81,
  entryDate: dayjs('2026-06-29'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
