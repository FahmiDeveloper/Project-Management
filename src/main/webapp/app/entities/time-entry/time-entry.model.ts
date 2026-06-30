import dayjs from 'dayjs/esm';
import { ITask } from 'app/entities/task/task.model';
import { IEmployee } from 'app/entities/employee/employee.model';

export interface ITimeEntry {
  id: number;
  description?: string | null;
  startTime?: dayjs.Dayjs | null;
  endTime?: dayjs.Dayjs | null;
  hours?: number | null;
  entryDate?: dayjs.Dayjs | null;
  task?: Pick<ITask, 'id' | 'title'> | null;
  employee?: Pick<IEmployee, 'id' | 'firstName'> | null;
}

export type NewTimeEntry = Omit<ITimeEntry, 'id'> & { id: null };
