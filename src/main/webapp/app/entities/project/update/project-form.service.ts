import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs/esm';

import { IProject, NewProject } from '../project.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IProject for edit and NewProjectFormGroupInput for create.
 */
type ProjectFormGroupInput = IProject | PartialWithRequiredKeyOf<NewProject>;

// startDate defaults to today when creating a new project.
type ProjectFormDefaults = Pick<NewProject, 'id'> & { startDate: dayjs.Dayjs | null };

// startDate/endDate are stored as native Date in the form because mat-datepicker
// (with MatNativeDateModule) cannot read/format dayjs objects. They are converted
// back to dayjs when the form value is read out via getProject().
type ProjectFormGroupContent = {
  id: FormControl<IProject['id'] | NewProject['id']>;
  code: FormControl<IProject['code']>;
  name: FormControl<IProject['name']>;
  description: FormControl<IProject['description']>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  budget: FormControl<IProject['budget']>;
  progress: FormControl<IProject['progress']>;
  status: FormControl<IProject['status']>;
  client: FormControl<IProject['client']>;
  manager: FormControl<IProject['manager']>;
};

export type ProjectFormGroup = FormGroup<ProjectFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ProjectFormService {
  createProjectFormGroup(project: ProjectFormGroupInput = { id: null }): ProjectFormGroup {
    const projectRawValue = {
      ...this.getFormDefaults(),
      ...project,
    };
    return new FormGroup<ProjectFormGroupContent>({
      id: new FormControl(
        { value: projectRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(projectRawValue.code, {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(20)],
      }),
      name: new FormControl(projectRawValue.name, {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(150)],
      }),
      description: new FormControl(projectRawValue.description),
      startDate: new FormControl(this.toDate(projectRawValue.startDate), {
        validators: [Validators.required],
      }),
      endDate: new FormControl(this.toDate(projectRawValue.endDate), {
        validators: [Validators.required],
      }),
      budget: new FormControl(projectRawValue.budget, {
        validators: [Validators.min(0)],
      }),
      progress: new FormControl(projectRawValue.progress, {
        validators: [Validators.required, Validators.min(0), Validators.max(100)],
      }),
      status: new FormControl(projectRawValue.status, {
        validators: [Validators.required],
      }),
      client: new FormControl(projectRawValue.client, {
        validators: [Validators.required],
      }),
      manager: new FormControl(projectRawValue.manager, {
        validators: [Validators.required],
      }),
    });
  }

  getProject(form: ProjectFormGroup): IProject | NewProject {
    const raw = form.getRawValue();
    return {
      ...raw,
      startDate: this.toDayjs(raw.startDate),
      endDate: this.toDayjs(raw.endDate),
    } as IProject | NewProject;
  }

  resetForm(form: ProjectFormGroup, project: ProjectFormGroupInput): void {
    const projectRawValue = { ...this.getFormDefaults(), ...project };
    form.reset(
      {
        ...projectRawValue,
        startDate: this.toDate(projectRawValue.startDate),
        endDate: this.toDate(projectRawValue.endDate),
        id: { value: projectRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ProjectFormDefaults {
    return {
      id: null,
      startDate: dayjs(), // today, used only when creating a new project
    };
  }

  // dayjs (from the API, or the today default) -> native Date (for mat-datepicker display)
  private toDate(value: dayjs.Dayjs | null | undefined): Date | null {
    if (!value) {
      return null;
    }
    const d = dayjs(value);
    return d.isValid() ? d.toDate() : null;
  }

  // native Date (from mat-datepicker) -> dayjs (for the API payload)
  private toDayjs(value: Date | null | undefined): dayjs.Dayjs | null {
    if (!value) {
      return null;
    }
    const d = dayjs(value);
    return d.isValid() ? d : null;
  }
}
