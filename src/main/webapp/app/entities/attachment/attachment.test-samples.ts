import dayjs from 'dayjs/esm';

import { IAttachment, NewAttachment } from './attachment.model';

export const sampleWithRequiredData: IAttachment = {
  id: 15526,
  fileName: 'ouch',
  fileUrl: 'until unruly',
  uploadedDate: dayjs('2026-06-30T17:40'),
};

export const sampleWithPartialData: IAttachment = {
  id: 30064,
  fileName: 'gently foolishly',
  fileUrl: 'realistic neat formal',
  fileType: 'mousse interestingly',
  fileSize: 2773,
  uploadedDate: dayjs('2026-06-30T05:06'),
};

export const sampleWithFullData: IAttachment = {
  id: 21727,
  fileName: 'hierarchy ha editor',
  fileUrl: 'unless',
  fileType: 'outside long',
  fileSize: 25433,
  uploadedDate: dayjs('2026-06-30T04:22'),
};

export const sampleWithNewData: NewAttachment = {
  fileName: 'fatally responsibility',
  fileUrl: 'fully though deeply',
  uploadedDate: dayjs('2026-06-30T02:08'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
