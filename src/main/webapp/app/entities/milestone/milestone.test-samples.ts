import dayjs from 'dayjs/esm';

import { IMilestone, NewMilestone } from './milestone.model';

export const sampleWithRequiredData: IMilestone = {
  id: 23161,
  title: 'zowie forenenst very',
  startDate: dayjs('2026-06-30'),
  dueDate: dayjs('2026-06-30'),
  status: 'COMPLETED',
};

export const sampleWithPartialData: IMilestone = {
  id: 18612,
  title: 'paralyse',
  description: '../fake-data/blob/hipster.txt',
  startDate: dayjs('2026-06-30'),
  dueDate: dayjs('2026-06-30'),
  status: 'PLANNED',
};

export const sampleWithFullData: IMilestone = {
  id: 22588,
  title: 'opposite',
  description: '../fake-data/blob/hipster.txt',
  startDate: dayjs('2026-06-30'),
  dueDate: dayjs('2026-06-30'),
  status: 'IN_PROGRESS',
};

export const sampleWithNewData: NewMilestone = {
  title: 'pointed contravene',
  startDate: dayjs('2026-06-29'),
  dueDate: dayjs('2026-06-29'),
  status: 'IN_PROGRESS',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
