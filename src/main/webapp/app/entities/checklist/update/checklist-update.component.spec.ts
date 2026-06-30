import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ITask } from 'app/entities/task/task.model';
import { TaskService } from 'app/entities/task/service/task.service';
import { ChecklistService } from '../service/checklist.service';
import { IChecklist } from '../checklist.model';
import { ChecklistFormService } from './checklist-form.service';

import { ChecklistUpdateComponent } from './checklist-update.component';

describe('Checklist Management Update Component', () => {
  let comp: ChecklistUpdateComponent;
  let fixture: ComponentFixture<ChecklistUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let checklistFormService: ChecklistFormService;
  let checklistService: ChecklistService;
  let taskService: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChecklistUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(ChecklistUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ChecklistUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    checklistFormService = TestBed.inject(ChecklistFormService);
    checklistService = TestBed.inject(ChecklistService);
    taskService = TestBed.inject(TaskService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Task query and add missing value', () => {
      const checklist: IChecklist = { id: 15108 };
      const task: ITask = { id: 25192 };
      checklist.task = task;

      const taskCollection: ITask[] = [{ id: 25192 }];
      jest.spyOn(taskService, 'query').mockReturnValue(of(new HttpResponse({ body: taskCollection })));
      const additionalTasks = [task];
      const expectedCollection: ITask[] = [...additionalTasks, ...taskCollection];
      jest.spyOn(taskService, 'addTaskToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ checklist });
      comp.ngOnInit();

      expect(taskService.query).toHaveBeenCalled();
      expect(taskService.addTaskToCollectionIfMissing).toHaveBeenCalledWith(
        taskCollection,
        ...additionalTasks.map(expect.objectContaining),
      );
      expect(comp.tasksSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const checklist: IChecklist = { id: 15108 };
      const task: ITask = { id: 25192 };
      checklist.task = task;

      activatedRoute.data = of({ checklist });
      comp.ngOnInit();

      expect(comp.tasksSharedCollection).toContainEqual(task);
      expect(comp.checklist).toEqual(checklist);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChecklist>>();
      const checklist = { id: 14950 };
      jest.spyOn(checklistFormService, 'getChecklist').mockReturnValue(checklist);
      jest.spyOn(checklistService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ checklist });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: checklist }));
      saveSubject.complete();

      // THEN
      expect(checklistFormService.getChecklist).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(checklistService.update).toHaveBeenCalledWith(expect.objectContaining(checklist));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChecklist>>();
      const checklist = { id: 14950 };
      jest.spyOn(checklistFormService, 'getChecklist').mockReturnValue({ id: null });
      jest.spyOn(checklistService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ checklist: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: checklist }));
      saveSubject.complete();

      // THEN
      expect(checklistFormService.getChecklist).toHaveBeenCalled();
      expect(checklistService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChecklist>>();
      const checklist = { id: 14950 };
      jest.spyOn(checklistService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ checklist });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(checklistService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareTask', () => {
      it('should forward to taskService', () => {
        const entity = { id: 25192 };
        const entity2 = { id: 22244 };
        jest.spyOn(taskService, 'compareTask');
        comp.compareTask(entity, entity2);
        expect(taskService.compareTask).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
