import dayjs from 'dayjs/esm';

import { ITask, NewTask } from './task.model';

export const sampleWithRequiredData: ITask = {
  id: 9181,
  title: 'or consequently',
  priority: 'HIGH',
  status: 'BLOCKED',
  completionPercentage: 51,
};

export const sampleWithPartialData: ITask = {
  id: 25547,
  title: 'satirise',
  description: '../fake-data/blob/hipster.txt',
  priority: 'LOW',
  status: 'TESTING',
  spentHours: 25083.68,
  startDate: dayjs('2026-06-30'),
  dueDate: dayjs('2026-06-29'),
  completionPercentage: 61,
};

export const sampleWithFullData: ITask = {
  id: 13396,
  title: 'where wherever',
  description: '../fake-data/blob/hipster.txt',
  priority: 'MEDIUM',
  status: 'DONE',
  storyPoints: 57,
  estimatedHours: 30404.02,
  spentHours: 6394.36,
  startDate: dayjs('2026-06-30'),
  dueDate: dayjs('2026-06-29'),
  completionPercentage: 13,
};

export const sampleWithNewData: NewTask = {
  title: 'expostulate',
  priority: 'MEDIUM',
  status: 'TESTING',
  completionPercentage: 100,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
