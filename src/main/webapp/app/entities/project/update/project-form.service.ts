import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

type ProjectFormDefaults = Pick<NewProject, 'id'>;

type ProjectFormGroupContent = {
  id: FormControl<IProject['id'] | NewProject['id']>;
  code: FormControl<IProject['code']>;
  name: FormControl<IProject['name']>;
  description: FormControl<IProject['description']>;
  startDate: FormControl<IProject['startDate']>;
  endDate: FormControl<IProject['endDate']>;
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
      startDate: new FormControl(projectRawValue.startDate, {
        validators: [Validators.required],
      }),
      endDate: new FormControl(projectRawValue.endDate),
      budget: new FormControl(projectRawValue.budget, {
        validators: [Validators.min(0)],
      }),
      progress: new FormControl(projectRawValue.progress, {
        validators: [Validators.required, Validators.min(0), Validators.max(100)],
      }),
      status: new FormControl(projectRawValue.status, {
        validators: [Validators.required],
      }),
      client: new FormControl(projectRawValue.client),
      manager: new FormControl(projectRawValue.manager),
    });
  }

  getProject(form: ProjectFormGroup): IProject | NewProject {
    return form.getRawValue() as IProject | NewProject;
  }

  resetForm(form: ProjectFormGroup, project: ProjectFormGroupInput): void {
    const projectRawValue = { ...this.getFormDefaults(), ...project };
    form.reset(
      {
        ...projectRawValue,
        id: { value: projectRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ProjectFormDefaults {
    return {
      id: null,
    };
  }
}
