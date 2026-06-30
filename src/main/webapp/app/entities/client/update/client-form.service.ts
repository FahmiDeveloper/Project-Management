import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IClient, NewClient } from '../client.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IClient for edit and NewClientFormGroupInput for create.
 */
type ClientFormGroupInput = IClient | PartialWithRequiredKeyOf<NewClient>;

type ClientFormDefaults = Pick<NewClient, 'id'>;

type ClientFormGroupContent = {
  id: FormControl<IClient['id'] | NewClient['id']>;
  companyName: FormControl<IClient['companyName']>;
  contactName: FormControl<IClient['contactName']>;
  email: FormControl<IClient['email']>;
  phone: FormControl<IClient['phone']>;
  address: FormControl<IClient['address']>;
  city: FormControl<IClient['city']>;
  country: FormControl<IClient['country']>;
  website: FormControl<IClient['website']>;
};

export type ClientFormGroup = FormGroup<ClientFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ClientFormService {
  createClientFormGroup(client: ClientFormGroupInput = { id: null }): ClientFormGroup {
    const clientRawValue = {
      ...this.getFormDefaults(),
      ...client,
    };
    return new FormGroup<ClientFormGroupContent>({
      id: new FormControl(
        { value: clientRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      companyName: new FormControl(clientRawValue.companyName, {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      }),
      contactName: new FormControl(clientRawValue.contactName, {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      }),
      email: new FormControl(clientRawValue.email, {
        validators: [Validators.required],
      }),
      phone: new FormControl(clientRawValue.phone, {
        validators: [Validators.maxLength(20)],
      }),
      address: new FormControl(clientRawValue.address, {
        validators: [Validators.maxLength(255)],
      }),
      city: new FormControl(clientRawValue.city, {
        validators: [Validators.maxLength(100)],
      }),
      country: new FormControl(clientRawValue.country, {
        validators: [Validators.maxLength(100)],
      }),
      website: new FormControl(clientRawValue.website, {
        validators: [Validators.maxLength(255)],
      }),
    });
  }

  getClient(form: ClientFormGroup): IClient | NewClient {
    return form.getRawValue() as IClient | NewClient;
  }

  resetForm(form: ClientFormGroup, client: ClientFormGroupInput): void {
    const clientRawValue = { ...this.getFormDefaults(), ...client };
    form.reset(
      {
        ...clientRawValue,
        id: { value: clientRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ClientFormDefaults {
    return {
      id: null,
    };
  }
}
