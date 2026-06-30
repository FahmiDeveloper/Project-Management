import { IChecklist } from 'app/entities/checklist/checklist.model';

export interface IChecklistItem {
  id: number;
  content?: string | null;
  isDone?: boolean | null;
  position?: number | null;
  checklist?: Pick<IChecklist, 'id' | 'title'> | null;
}

export type NewChecklistItem = Omit<IChecklistItem, 'id'> & { id: null };
