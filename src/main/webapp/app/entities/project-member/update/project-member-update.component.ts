import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { MemberRole } from 'app/entities/enumerations/member-role.model';
import { ProjectMemberService } from '../service/project-member.service';
import { IProjectMember } from '../project-member.model';
import { ProjectMemberFormGroup, ProjectMemberFormService } from './project-member-form.service';

@Component({
  selector: 'jhi-project-member-update',
  templateUrl: './project-member-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ProjectMemberUpdateComponent implements OnInit {
  isSaving = false;
  projectMember: IProjectMember | null = null;
  memberRoleValues = Object.keys(MemberRole);

  projectsSharedCollection: IProject[] = [];
  employeesSharedCollection: IEmployee[] = [];

  protected projectMemberService = inject(ProjectMemberService);
  protected projectMemberFormService = inject(ProjectMemberFormService);
  protected projectService = inject(ProjectService);
  protected employeeService = inject(EmployeeService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ProjectMemberFormGroup = this.projectMemberFormService.createProjectMemberFormGroup();

  compareProject = (o1: IProject | null, o2: IProject | null): boolean => this.projectService.compareProject(o1, o2);

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projectMember }) => {
      this.projectMember = projectMember;
      if (projectMember) {
        this.updateForm(projectMember);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const projectMember = this.projectMemberFormService.getProjectMember(this.editForm);
    if (projectMember.id !== null) {
      this.subscribeToSaveResponse(this.projectMemberService.update(projectMember));
    } else {
      this.subscribeToSaveResponse(this.projectMemberService.create(projectMember));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IProjectMember>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(projectMember: IProjectMember): void {
    this.projectMember = projectMember;
    this.projectMemberFormService.resetForm(this.editForm, projectMember);

    this.projectsSharedCollection = this.projectService.addProjectToCollectionIfMissing<IProject>(
      this.projectsSharedCollection,
      projectMember.project,
    );
    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      projectMember.employee,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.projectService
      .query()
      .pipe(map((res: HttpResponse<IProject[]>) => res.body ?? []))
      .pipe(
        map((projects: IProject[]) => this.projectService.addProjectToCollectionIfMissing<IProject>(projects, this.projectMember?.project)),
      )
      .subscribe((projects: IProject[]) => (this.projectsSharedCollection = projects));

    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.projectMember?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));
  }
}
