import dayjs from 'dayjs/esm';

import { IReportSnapshot, NewReportSnapshot } from './report-snapshot.model';

export const sampleWithRequiredData: IReportSnapshot = {
  id: 22191,
  name: 'crackle bump',
  type: 'lace ha',
  generatedDate: dayjs('2026-06-29T20:36'),
};

export const sampleWithPartialData: IReportSnapshot = {
  id: 6127,
  name: 'pharmacopoeia',
  type: 'besides',
  generatedDate: dayjs('2026-06-30T07:57'),
};

export const sampleWithFullData: IReportSnapshot = {
  id: 7276,
  name: 'until lay preregister',
  type: 'kookily',
  generatedDate: dayjs('2026-06-30T09:54'),
  data: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewReportSnapshot = {
  name: 'ha helplessly',
  type: 'misfire but once',
  generatedDate: dayjs('2026-06-30T16:08'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
