import dayjs from 'dayjs/esm';
import { ITask } from 'app/entities/task/task.model';
import { IEmployee } from 'app/entities/employee/employee.model';

export interface ITaskComment {
  id: number;
  content?: string | null;
  createdDate?: dayjs.Dayjs | null;
  task?: Pick<ITask, 'id' | 'title'> | null;
  employee?: Pick<IEmployee, 'id' | 'firstName'> | null;
}

export type NewTaskComment = Omit<ITaskComment, 'id'> & { id: null };
