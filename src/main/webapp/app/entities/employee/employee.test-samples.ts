import dayjs from 'dayjs/esm';

import { IEmployee, NewEmployee } from './employee.model';

export const sampleWithRequiredData: IEmployee = {
  id: 8899,
  employeeNumber: 'blushing institute',
  firstName: 'Yvonne',
  lastName: 'Mayert',
  jobTitle: 'Product Assurance Facilitator',
  hireDate: dayjs('2026-06-30'),
};

export const sampleWithPartialData: IEmployee = {
  id: 5984,
  employeeNumber: 'poetry',
  firstName: 'Neil',
  lastName: 'Boyle',
  phone: '950-571-2323 x7298',
  jobTitle: 'International Tactics Analyst',
  hireDate: dayjs('2026-06-30'),
};

export const sampleWithFullData: IEmployee = {
  id: 19019,
  employeeNumber: 'sharply questionably',
  firstName: 'Jaiden',
  lastName: 'Champlin',
  phone: '1-377-995-7669 x5272',
  jobTitle: 'International Marketing Architect',
  hireDate: dayjs('2026-06-29'),
};

export const sampleWithNewData: NewEmployee = {
  employeeNumber: 'unless',
  firstName: 'Naomie',
  lastName: 'Walsh',
  jobTitle: 'Corporate Security Representative',
  hireDate: dayjs('2026-06-29'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
