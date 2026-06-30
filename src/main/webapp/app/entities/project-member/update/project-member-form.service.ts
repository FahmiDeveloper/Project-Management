import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IProjectMember, NewProjectMember } from '../project-member.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IProjectMember for edit and NewProjectMemberFormGroupInput for create.
 */
type ProjectMemberFormGroupInput = IProjectMember | PartialWithRequiredKeyOf<NewProjectMember>;

type ProjectMemberFormDefaults = Pick<NewProjectMember, 'id' | 'active'>;

type ProjectMemberFormGroupContent = {
  id: FormControl<IProjectMember['id'] | NewProjectMember['id']>;
  role: FormControl<IProjectMember['role']>;
  joinedDate: FormControl<IProjectMember['joinedDate']>;
  active: FormControl<IProjectMember['active']>;
  project: FormControl<IProjectMember['project']>;
  employee: FormControl<IProjectMember['employee']>;
};

export type ProjectMemberFormGroup = FormGroup<ProjectMemberFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ProjectMemberFormService {
  createProjectMemberFormGroup(projectMember: ProjectMemberFormGroupInput = { id: null }): ProjectMemberFormGroup {
    const projectMemberRawValue = {
      ...this.getFormDefaults(),
      ...projectMember,
    };
    return new FormGroup<ProjectMemberFormGroupContent>({
      id: new FormControl(
        { value: projectMemberRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      role: new FormControl(projectMemberRawValue.role, {
        validators: [Validators.required],
      }),
      joinedDate: new FormControl(projectMemberRawValue.joinedDate, {
        validators: [Validators.required],
      }),
      active: new FormControl(projectMemberRawValue.active, {
        validators: [Validators.required],
      }),
      project: new FormControl(projectMemberRawValue.project),
      employee: new FormControl(projectMemberRawValue.employee),
    });
  }

  getProjectMember(form: ProjectMemberFormGroup): IProjectMember | NewProjectMember {
    return form.getRawValue() as IProjectMember | NewProjectMember;
  }

  resetForm(form: ProjectMemberFormGroup, projectMember: ProjectMemberFormGroupInput): void {
    const projectMemberRawValue = { ...this.getFormDefaults(), ...projectMember };
    form.reset(
      {
        ...projectMemberRawValue,
        id: { value: projectMemberRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ProjectMemberFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}
