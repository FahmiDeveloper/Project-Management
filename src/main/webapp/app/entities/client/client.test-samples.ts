import { IClient, NewClient } from './client.model';

export const sampleWithRequiredData: IClient = {
  id: 16289,
  companyName: 'save colour yippee',
  contactName: 'including seriously coordination',
  email: 'Sandy_OHara6@hotmail.com',
};

export const sampleWithPartialData: IClient = {
  id: 12862,
  companyName: 'next truly harvest',
  contactName: 'dimly',
  email: 'Jenifer.Schoen37@gmail.com',
  phone: '702.449.5094',
  address: 'pfft which obvious',
  city: 'Parisianland',
  country: "Cote d'Ivoire",
  website: 'coaxingly',
};

export const sampleWithFullData: IClient = {
  id: 31496,
  companyName: 'boohoo shipper soggy',
  contactName: 'that consequently',
  email: 'Kenyatta_Huel93@gmail.com',
  phone: '(659) 688-6882',
  address: 'portray clinch',
  city: 'Oro Valley',
  country: 'Estonia',
  website: 'pish',
};

export const sampleWithNewData: NewClient = {
  companyName: 'seemingly excepting',
  contactName: 'jagged variable',
  email: 'Tre_Beer68@hotmail.com',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
