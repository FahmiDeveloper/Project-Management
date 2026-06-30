import dayjs from 'dayjs/esm';
import { IEmployee } from 'app/entities/employee/employee.model';

export interface INotification {
  id: number;
  title?: string | null;
  message?: string | null;
  type?: string | null;
  isRead?: boolean | null;
  createdDate?: dayjs.Dayjs | null;
  employee?: Pick<IEmployee, 'id' | 'firstName'> | null;
}

export type NewNotification = Omit<INotification, 'id'> & { id: null };
