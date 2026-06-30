import dayjs from 'dayjs/esm';

import { ISprint, NewSprint } from './sprint.model';

export const sampleWithRequiredData: ISprint = {
  id: 4944,
  name: 'dreamily kooky',
  startDate: dayjs('2026-06-29'),
  endDate: dayjs('2026-06-30'),
  status: 'COMPLETED',
};

export const sampleWithPartialData: ISprint = {
  id: 21300,
  name: 'up because however',
  startDate: dayjs('2026-06-30'),
  endDate: dayjs('2026-06-30'),
  status: 'ACTIVE',
};

export const sampleWithFullData: ISprint = {
  id: 15912,
  name: 'similar concerning anenst',
  goal: '../fake-data/blob/hipster.txt',
  startDate: dayjs('2026-06-30'),
  endDate: dayjs('2026-06-30'),
  status: 'COMPLETED',
  capacity: 25557,
  velocity: 21023,
};

export const sampleWithNewData: NewSprint = {
  name: 'yahoo',
  startDate: dayjs('2026-06-30'),
  endDate: dayjs('2026-06-30'),
  status: 'ACTIVE',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
