import dayjs from 'dayjs/esm';

import { IChecklist, NewChecklist } from './checklist.model';

export const sampleWithRequiredData: IChecklist = {
  id: 29481,
  title: 'while wearily',
  createdDate: dayjs('2026-06-30T13:32'),
};

export const sampleWithPartialData: IChecklist = {
  id: 16031,
  title: 'as why ugh',
  createdDate: dayjs('2026-06-30T06:49'),
};

export const sampleWithFullData: IChecklist = {
  id: 18179,
  title: 'stiffen from an',
  createdDate: dayjs('2026-06-29T18:38'),
};

export const sampleWithNewData: NewChecklist = {
  title: 'resort',
  createdDate: dayjs('2026-06-30T07:42'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
