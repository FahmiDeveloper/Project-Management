import dayjs from 'dayjs/esm';

import { IProject, NewProject } from './project.model';

export const sampleWithRequiredData: IProject = {
  id: 22823,
  code: 'anxiously',
  name: 'despite step quash',
  startDate: dayjs('2026-06-30'),
  progress: 0,
  status: 'PLANNED',
};

export const sampleWithPartialData: IProject = {
  id: 26103,
  code: 'yowza doubtfully',
  name: 'yesterday',
  startDate: dayjs('2026-06-30'),
  endDate: dayjs('2026-06-30'),
  progress: 84,
  status: 'PLANNED',
};

export const sampleWithFullData: IProject = {
  id: 1375,
  code: 'tray pack hydrolyze',
  name: 'as',
  description: '../fake-data/blob/hipster.txt',
  startDate: dayjs('2026-06-29'),
  endDate: dayjs('2026-06-30'),
  budget: 9208.83,
  progress: 89,
  status: 'PLANNED',
};

export const sampleWithNewData: NewProject = {
  code: 'zowie vice',
  name: 'ew to',
  startDate: dayjs('2026-06-30'),
  progress: 24,
  status: 'COMPLETED',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
