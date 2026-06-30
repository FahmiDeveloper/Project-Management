import dayjs from 'dayjs/esm';
import { ITask } from 'app/entities/task/task.model';
import { IEmployee } from 'app/entities/employee/employee.model';

export interface IAttachment {
  id: number;
  fileName?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  uploadedDate?: dayjs.Dayjs | null;
  task?: Pick<ITask, 'id' | 'title'> | null;
  employee?: Pick<IEmployee, 'id' | 'firstName'> | null;
}

export type NewAttachment = Omit<IAttachment, 'id'> & { id: null };
