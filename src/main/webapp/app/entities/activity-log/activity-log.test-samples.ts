import dayjs from 'dayjs/esm';

import { IActivityLog, NewActivityLog } from './activity-log.model';

export const sampleWithRequiredData: IActivityLog = {
  id: 3150,
  action: 'qua',
  entityName: 'expense yippee',
  createdDate: dayjs('2026-06-30T05:39'),
};

export const sampleWithPartialData: IActivityLog = {
  id: 530,
  action: 'powerfully bump',
  entityName: 'carelessly blue by',
  entityId: 22529,
  description: 'consequently fiercely',
  createdDate: dayjs('2026-06-29T20:20'),
};

export const sampleWithFullData: IActivityLog = {
  id: 30848,
  action: 'director',
  entityName: 'gadzooks submissive',
  entityId: 21373,
  description: 'bewail beneath',
  createdDate: dayjs('2026-06-29T22:37'),
};

export const sampleWithNewData: NewActivityLog = {
  action: 'where left',
  entityName: 'glider out',
  createdDate: dayjs('2026-06-30T09:45'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
