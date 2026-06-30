import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../checklist-item.test-samples';

import { ChecklistItemFormService } from './checklist-item-form.service';

describe('ChecklistItem Form Service', () => {
  let service: ChecklistItemFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChecklistItemFormService);
  });

  describe('Service methods', () => {
    describe('createChecklistItemFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createChecklistItemFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            content: expect.any(Object),
            isDone: expect.any(Object),
            position: expect.any(Object),
            checklist: expect.any(Object),
          }),
        );
      });

      it('passing IChecklistItem should create a new form with FormGroup', () => {
        const formGroup = service.createChecklistItemFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            content: expect.any(Object),
            isDone: expect.any(Object),
            position: expect.any(Object),
            checklist: expect.any(Object),
          }),
        );
      });
    });

    describe('getChecklistItem', () => {
      it('should return NewChecklistItem for default ChecklistItem initial value', () => {
        const formGroup = service.createChecklistItemFormGroup(sampleWithNewData);

        const checklistItem = service.getChecklistItem(formGroup) as any;

        expect(checklistItem).toMatchObject(sampleWithNewData);
      });

      it('should return NewChecklistItem for empty ChecklistItem initial value', () => {
        const formGroup = service.createChecklistItemFormGroup();

        const checklistItem = service.getChecklistItem(formGroup) as any;

        expect(checklistItem).toMatchObject({});
      });

      it('should return IChecklistItem', () => {
        const formGroup = service.createChecklistItemFormGroup(sampleWithRequiredData);

        const checklistItem = service.getChecklistItem(formGroup) as any;

        expect(checklistItem).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IChecklistItem should not enable id FormControl', () => {
        const formGroup = service.createChecklistItemFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewChecklistItem should disable id FormControl', () => {
        const formGroup = service.createChecklistItemFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
