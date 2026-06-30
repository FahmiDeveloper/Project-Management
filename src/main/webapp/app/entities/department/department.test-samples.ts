import { IDepartment, NewDepartment } from './department.model';

export const sampleWithRequiredData: IDepartment = {
  id: 32001,
  name: 'phew',
};

export const sampleWithPartialData: IDepartment = {
  id: 26867,
  name: 'pfft',
};

export const sampleWithFullData: IDepartment = {
  id: 13276,
  name: 'endow',
  description: 'headline save',
};

export const sampleWithNewData: NewDepartment = {
  name: 'peaceful if',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
