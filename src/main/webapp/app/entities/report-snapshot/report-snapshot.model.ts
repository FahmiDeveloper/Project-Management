import dayjs from 'dayjs/esm';
import { IProject } from 'app/entities/project/project.model';

export interface IReportSnapshot {
  id: number;
  name?: string | null;
  type?: string | null;
  generatedDate?: dayjs.Dayjs | null;
  data?: string | null;
  project?: Pick<IProject, 'id' | 'name'> | null;
}

export type NewReportSnapshot = Omit<IReportSnapshot, 'id'> & { id: null };
