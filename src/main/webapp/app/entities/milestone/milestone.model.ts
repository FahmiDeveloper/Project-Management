import dayjs from 'dayjs/esm';
import { IProject } from 'app/entities/project/project.model';
import { MilestoneStatus } from 'app/entities/enumerations/milestone-status.model';

export interface IMilestone {
  id: number;
  title?: string | null;
  description?: string | null;
  startDate?: dayjs.Dayjs | null;
  dueDate?: dayjs.Dayjs | null;
  status?: keyof typeof MilestoneStatus | null;
  project?: Pick<IProject, 'id' | 'name'> | null;
}

export type NewMilestone = Omit<IMilestone, 'id'> & { id: null };
