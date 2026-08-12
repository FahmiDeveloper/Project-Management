import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs/esm';

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

// joinedDate defaults to today when creating a new project member.
type ProjectMemberFormDefaults = Pick<NewProjectMember, 'id' | 'active'> & { joinedDate: dayjs.Dayjs | null };

// joinedDate is stored as native Date in the form because mat-datepicker
// (with MatNativeDateModule) cannot read/format dayjs objects. It is converted
// back to dayjs when the form value is read out via getProjectMember().
type ProjectMemberFormGroupContent = {
  id: FormControl<IProjectMember['id'] | NewProjectMember['id']>;
  role: FormControl<IProjectMember['role']>;
  joinedDate: FormControl<Date | null>;
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
      joinedDate: new FormControl(this.toDate(projectMemberRawValue.joinedDate), {
        validators: [Validators.required],
      }),
      active: new FormControl(projectMemberRawValue.active, {
        validators: [Validators.required],
      }),
      project: new FormControl(projectMemberRawValue.project, {
        validators: [Validators.required],
      }),
      employee: new FormControl(projectMemberRawValue.employee, {
        validators: [Validators.required],
      }),
    });
  }

  getProjectMember(form: ProjectMemberFormGroup): IProjectMember | NewProjectMember {
    const raw = form.getRawValue();
    return {
      ...raw,
      joinedDate: this.toDayjs(raw.joinedDate),
    } as IProjectMember | NewProjectMember;
  }

  resetForm(form: ProjectMemberFormGroup, projectMember: ProjectMemberFormGroupInput): void {
    const projectMemberRawValue = { ...this.getFormDefaults(), ...projectMember };
    form.reset(
      {
        ...projectMemberRawValue,
        joinedDate: this.toDate(projectMemberRawValue.joinedDate),
        id: { value: projectMemberRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ProjectMemberFormDefaults {
    return {
      id: null,
      active: false,
      joinedDate: dayjs(), // today, used only when creating a new project member
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
