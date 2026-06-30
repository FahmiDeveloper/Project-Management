import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../checklist.test-samples';

import { ChecklistFormService } from './checklist-form.service';

describe('Checklist Form Service', () => {
  let service: ChecklistFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChecklistFormService);
  });

  describe('Service methods', () => {
    describe('createChecklistFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createChecklistFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            createdDate: expect.any(Object),
            task: expect.any(Object),
          }),
        );
      });

      it('passing IChecklist should create a new form with FormGroup', () => {
        const formGroup = service.createChecklistFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            createdDate: expect.any(Object),
            task: expect.any(Object),
          }),
        );
      });
    });

    describe('getChecklist', () => {
      it('should return NewChecklist for default Checklist initial value', () => {
        const formGroup = service.createChecklistFormGroup(sampleWithNewData);

        const checklist = service.getChecklist(formGroup) as any;

        expect(checklist).toMatchObject(sampleWithNewData);
      });

      it('should return NewChecklist for empty Checklist initial value', () => {
        const formGroup = service.createChecklistFormGroup();

        const checklist = service.getChecklist(formGroup) as any;

        expect(checklist).toMatchObject({});
      });

      it('should return IChecklist', () => {
        const formGroup = service.createChecklistFormGroup(sampleWithRequiredData);

        const checklist = service.getChecklist(formGroup) as any;

        expect(checklist).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IChecklist should not enable id FormControl', () => {
        const formGroup = service.createChecklistFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewChecklist should disable id FormControl', () => {
        const formGroup = service.createChecklistFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
