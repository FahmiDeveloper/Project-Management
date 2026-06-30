import dayjs from 'dayjs/esm';
import { IClient } from 'app/entities/client/client.model';
import { IEmployee } from 'app/entities/employee/employee.model';
import { ProjectStatus } from 'app/entities/enumerations/project-status.model';

export interface IProject {
  id: number;
  code?: string | null;
  name?: string | null;
  description?: string | null;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  budget?: number | null;
  progress?: number | null;
  status?: keyof typeof ProjectStatus | null;
  client?: Pick<IClient, 'id'> | null;
  manager?: Pick<IEmployee, 'id'> | null;
}

export type NewProject = Omit<IProject, 'id'> & { id: null };
