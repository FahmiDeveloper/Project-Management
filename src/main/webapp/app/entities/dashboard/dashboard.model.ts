import dayjs from 'dayjs/esm';
import { IEmployee } from 'app/entities/employee/employee.model';
import { IProject } from 'app/entities/project/project.model';

export interface IDashboard {
  id: number;
  name?: string | null;
  description?: string | null;
  layout?: string | null;
  config?: string | null;
  isDefault?: boolean | null;
  createdDate?: dayjs.Dayjs | null;
  updatedDate?: dayjs.Dayjs | null;
  employee?: Pick<IEmployee, 'id' | 'firstName'> | null;
  project?: Pick<IProject, 'id' | 'name'> | null;
}

export type NewDashboard = Omit<IDashboard, 'id'> & { id: null };
