import dayjs from 'dayjs/esm';
import { ITask } from 'app/entities/task/task.model';

export interface IChecklist {
  id: number;
  title?: string | null;
  createdDate?: dayjs.Dayjs | null;
  task?: Pick<ITask, 'id' | 'title'> | null;
}

export type NewChecklist = Omit<IChecklist, 'id'> & { id: null };
