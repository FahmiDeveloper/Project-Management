import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../project-member.test-samples';

import { ProjectMemberFormService } from './project-member-form.service';

describe('ProjectMember Form Service', () => {
  let service: ProjectMemberFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectMemberFormService);
  });

  describe('Service methods', () => {
    describe('createProjectMemberFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createProjectMemberFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            role: expect.any(Object),
            joinedDate: expect.any(Object),
            active: expect.any(Object),
            project: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });

      it('passing IProjectMember should create a new form with FormGroup', () => {
        const formGroup = service.createProjectMemberFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            role: expect.any(Object),
            joinedDate: expect.any(Object),
            active: expect.any(Object),
            project: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });
    });

    describe('getProjectMember', () => {
      it('should return NewProjectMember for default ProjectMember initial value', () => {
        const formGroup = service.createProjectMemberFormGroup(sampleWithNewData);

        const projectMember = service.getProjectMember(formGroup) as any;

        expect(projectMember).toMatchObject(sampleWithNewData);
      });

      it('should return NewProjectMember for empty ProjectMember initial value', () => {
        const formGroup = service.createProjectMemberFormGroup();

        const projectMember = service.getProjectMember(formGroup) as any;

        expect(projectMember).toMatchObject({});
      });

      it('should return IProjectMember', () => {
        const formGroup = service.createProjectMemberFormGroup(sampleWithRequiredData);

        const projectMember = service.getProjectMember(formGroup) as any;

        expect(projectMember).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IProjectMember should not enable id FormControl', () => {
        const formGroup = service.createProjectMemberFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewProjectMember should disable id FormControl', () => {
        const formGroup = service.createProjectMemberFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
