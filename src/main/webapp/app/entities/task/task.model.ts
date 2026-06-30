import dayjs from 'dayjs/esm';
import { ISprint } from 'app/entities/sprint/sprint.model';
import { IMilestone } from 'app/entities/milestone/milestone.model';
import { IEmployee } from 'app/entities/employee/employee.model';
import { TaskPriority } from 'app/entities/enumerations/task-priority.model';
import { TaskStatus } from 'app/entities/enumerations/task-status.model';

export interface ITask {
  id: number;
  title?: string | null;
  description?: string | null;
  priority?: keyof typeof TaskPriority | null;
  status?: keyof typeof TaskStatus | null;
  storyPoints?: number | null;
  estimatedHours?: number | null;
  spentHours?: number | null;
  startDate?: dayjs.Dayjs | null;
  dueDate?: dayjs.Dayjs | null;
  completionPercentage?: number | null;
  sprint?: Pick<ISprint, 'id' | 'name'> | null;
  milestone?: Pick<IMilestone, 'id' | 'title'> | null;
  assignedTo?: Pick<IEmployee, 'id' | 'employeeNumber'> | null;
  createdBy?: Pick<IEmployee, 'id' | 'employeeNumber'> | null;
}

export type NewTask = Omit<ITask, 'id'> & { id: null };
