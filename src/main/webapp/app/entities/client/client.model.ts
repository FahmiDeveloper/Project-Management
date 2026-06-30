export interface IClient {
  id: number;
  companyName?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
}

export type NewClient = Omit<IClient, 'id'> & { id: null };
