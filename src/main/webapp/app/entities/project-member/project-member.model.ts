import dayjs from 'dayjs/esm';
import { IProject } from 'app/entities/project/project.model';
import { IEmployee } from 'app/entities/employee/employee.model';
import { MemberRole } from 'app/entities/enumerations/member-role.model';

export interface IProjectMember {
  id: number;
  role?: keyof typeof MemberRole | null;
  joinedDate?: dayjs.Dayjs | null;
  active?: boolean | null;
  project?: Pick<IProject, 'id' | 'name'> | null;
  employee?: Pick<IEmployee, 'id' | 'firstName' | 'lastName'> | null;
}

export type NewProjectMember = Omit<IProjectMember, 'id'> & { id: null };
