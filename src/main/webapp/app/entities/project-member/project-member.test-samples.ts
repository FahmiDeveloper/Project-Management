import dayjs from 'dayjs/esm';

import { IProjectMember, NewProjectMember } from './project-member.model';

export const sampleWithRequiredData: IProjectMember = {
  id: 24652,
  role: 'TESTER',
  joinedDate: dayjs('2026-06-30'),
  active: false,
};

export const sampleWithPartialData: IProjectMember = {
  id: 22328,
  role: 'DEVELOPER',
  joinedDate: dayjs('2026-06-29'),
  active: false,
};

export const sampleWithFullData: IProjectMember = {
  id: 1041,
  role: 'TEAM_LEAD',
  joinedDate: dayjs('2026-06-30'),
  active: true,
};

export const sampleWithNewData: NewProjectMember = {
  role: 'TEAM_LEAD',
  joinedDate: dayjs('2026-06-29'),
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
