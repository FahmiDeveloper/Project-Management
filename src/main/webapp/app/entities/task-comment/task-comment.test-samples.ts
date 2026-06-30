import dayjs from 'dayjs/esm';

import { ITaskComment, NewTaskComment } from './task-comment.model';

export const sampleWithRequiredData: ITaskComment = {
  id: 8559,
  content: '../fake-data/blob/hipster.txt',
  createdDate: dayjs('2026-06-30T05:30'),
};

export const sampleWithPartialData: ITaskComment = {
  id: 6006,
  content: '../fake-data/blob/hipster.txt',
  createdDate: dayjs('2026-06-30T07:54'),
};

export const sampleWithFullData: ITaskComment = {
  id: 9379,
  content: '../fake-data/blob/hipster.txt',
  createdDate: dayjs('2026-06-29T20:14'),
};

export const sampleWithNewData: NewTaskComment = {
  content: '../fake-data/blob/hipster.txt',
  createdDate: dayjs('2026-06-29T22:18'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
