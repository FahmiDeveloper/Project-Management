export interface IDepartment {
  id: number;
  name?: string | null;
  description?: string | null;
}

export type NewDepartment = Omit<IDepartment, 'id'> & { id: null };
