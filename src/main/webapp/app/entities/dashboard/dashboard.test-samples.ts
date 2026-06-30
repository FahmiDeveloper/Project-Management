import dayjs from 'dayjs/esm';

import { IDashboard, NewDashboard } from './dashboard.model';

export const sampleWithRequiredData: IDashboard = {
  id: 29725,
  name: 'whose apud bouncy',
  layout: 'fen supposing pish',
  isDefault: false,
  createdDate: dayjs('2026-06-30T02:05'),
};

export const sampleWithPartialData: IDashboard = {
  id: 8814,
  name: 'obediently ew',
  layout: 'instantly',
  config: '../fake-data/blob/hipster.txt',
  isDefault: true,
  createdDate: dayjs('2026-06-30T09:49'),
  updatedDate: dayjs('2026-06-30T13:03'),
};

export const sampleWithFullData: IDashboard = {
  id: 14801,
  name: 'worth galvanize through',
  description: 'coolly offensively phew',
  layout: 'platypus statement',
  config: '../fake-data/blob/hipster.txt',
  isDefault: false,
  createdDate: dayjs('2026-06-29T19:03'),
  updatedDate: dayjs('2026-06-29T23:46'),
};

export const sampleWithNewData: NewDashboard = {
  name: 'excluding underneath however',
  layout: 'shabby approximate hubris',
  isDefault: true,
  createdDate: dayjs('2026-06-30T05:25'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
