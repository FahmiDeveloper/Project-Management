import dayjs from 'dayjs/esm';
import { IProject } from 'app/entities/project/project.model';
import { SprintStatus } from 'app/entities/enumerations/sprint-status.model';

export interface ISprint {
  id: number;
  name?: string | null;
  goal?: string | null;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  status?: keyof typeof SprintStatus | null;
  capacity?: number | null;
  velocity?: number | null;
  project?: Pick<IProject, 'id' | 'name'> | null;
}

export type NewSprint = Omit<ISprint, 'id'> & { id: null };
