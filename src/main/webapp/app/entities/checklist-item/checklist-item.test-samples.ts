import { IChecklistItem, NewChecklistItem } from './checklist-item.model';

export const sampleWithRequiredData: IChecklistItem = {
  id: 12664,
  content: 'fixed',
  isDone: true,
};

export const sampleWithPartialData: IChecklistItem = {
  id: 11483,
  content: 'adventurously phooey the',
  isDone: true,
  position: 11722,
};

export const sampleWithFullData: IChecklistItem = {
  id: 15558,
  content: 'yearn',
  isDone: false,
  position: 16529,
};

export const sampleWithNewData: NewChecklistItem = {
  content: 'yummy once acidic',
  isDone: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
