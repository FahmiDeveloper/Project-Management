import dayjs from 'dayjs/esm';
import { IEmployee } from 'app/entities/employee/employee.model';

export interface IActivityLog {
  id: number;
  action?: string | null;
  entityName?: string | null;
  entityId?: number | null;
  description?: string | null;
  createdDate?: dayjs.Dayjs | null;
  employee?: Pick<IEmployee, 'id' | 'firstName'> | null;
}

export type NewActivityLog = Omit<IActivityLog, 'id'> & { id: null };
