import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../task-comment.test-samples';

import { TaskCommentFormService } from './task-comment-form.service';

describe('TaskComment Form Service', () => {
  let service: TaskCommentFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskCommentFormService);
  });

  describe('Service methods', () => {
    describe('createTaskCommentFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTaskCommentFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            content: expect.any(Object),
            createdDate: expect.any(Object),
            task: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });

      it('passing ITaskComment should create a new form with FormGroup', () => {
        const formGroup = service.createTaskCommentFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            content: expect.any(Object),
            createdDate: expect.any(Object),
            task: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });
    });

    describe('getTaskComment', () => {
      it('should return NewTaskComment for default TaskComment initial value', () => {
        const formGroup = service.createTaskCommentFormGroup(sampleWithNewData);

        const taskComment = service.getTaskComment(formGroup) as any;

        expect(taskComment).toMatchObject(sampleWithNewData);
      });

      it('should return NewTaskComment for empty TaskComment initial value', () => {
        const formGroup = service.createTaskCommentFormGroup();

        const taskComment = service.getTaskComment(formGroup) as any;

        expect(taskComment).toMatchObject({});
      });

      it('should return ITaskComment', () => {
        const formGroup = service.createTaskCommentFormGroup(sampleWithRequiredData);

        const taskComment = service.getTaskComment(formGroup) as any;

        expect(taskComment).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITaskComment should not enable id FormControl', () => {
        const formGroup = service.createTaskCommentFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTaskComment should disable id FormControl', () => {
        const formGroup = service.createTaskCommentFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
