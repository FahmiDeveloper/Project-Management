import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';
import { IDepartment } from 'app/entities/department/department.model';

export interface IEmployee {
  id: number;
  employeeNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  hireDate?: dayjs.Dayjs | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
  department?: Pick<IDepartment, 'id' | 'name'> | null;
}

export type NewEmployee = Omit<IEmployee, 'id'> & { id: null };
