import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ITask } from 'app/entities/task/task.model';
import { TaskService } from 'app/entities/task/service/task.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ITaskComment } from '../task-comment.model';
import { TaskCommentService } from '../service/task-comment.service';
import { TaskCommentFormService } from './task-comment-form.service';

import { TaskCommentUpdateComponent } from './task-comment-update.component';

describe('TaskComment Management Update Component', () => {
  let comp: TaskCommentUpdateComponent;
  let fixture: ComponentFixture<TaskCommentUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let taskCommentFormService: TaskCommentFormService;
  let taskCommentService: TaskCommentService;
  let taskService: TaskService;
  let employeeService: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskCommentUpdateComponent],
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
      .overrideTemplate(TaskCommentUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TaskCommentUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    taskCommentFormService = TestBed.inject(TaskCommentFormService);
    taskCommentService = TestBed.inject(TaskCommentService);
    taskService = TestBed.inject(TaskService);
    employeeService = TestBed.inject(EmployeeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Task query and add missing value', () => {
      const taskComment: ITaskComment = { id: 4650 };
      const task: ITask = { id: 25192 };
      taskComment.task = task;

      const taskCollection: ITask[] = [{ id: 25192 }];
      jest.spyOn(taskService, 'query').mockReturnValue(of(new HttpResponse({ body: taskCollection })));
      const additionalTasks = [task];
      const expectedCollection: ITask[] = [...additionalTasks, ...taskCollection];
      jest.spyOn(taskService, 'addTaskToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ taskComment });
      comp.ngOnInit();

      expect(taskService.query).toHaveBeenCalled();
      expect(taskService.addTaskToCollectionIfMissing).toHaveBeenCalledWith(
        taskCollection,
        ...additionalTasks.map(expect.objectContaining),
      );
      expect(comp.tasksSharedCollection).toEqual(expectedCollection);
    });

    it('should call Employee query and add missing value', () => {
      const taskComment: ITaskComment = { id: 4650 };
      const employee: IEmployee = { id: 1749 };
      taskComment.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ taskComment });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const taskComment: ITaskComment = { id: 4650 };
      const task: ITask = { id: 25192 };
      taskComment.task = task;
      const employee: IEmployee = { id: 1749 };
      taskComment.employee = employee;

      activatedRoute.data = of({ taskComment });
      comp.ngOnInit();

      expect(comp.tasksSharedCollection).toContainEqual(task);
      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.taskComment).toEqual(taskComment);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITaskComment>>();
      const taskComment = { id: 17531 };
      jest.spyOn(taskCommentFormService, 'getTaskComment').mockReturnValue(taskComment);
      jest.spyOn(taskCommentService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ taskComment });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: taskComment }));
      saveSubject.complete();

      // THEN
      expect(taskCommentFormService.getTaskComment).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(taskCommentService.update).toHaveBeenCalledWith(expect.objectContaining(taskComment));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITaskComment>>();
      const taskComment = { id: 17531 };
      jest.spyOn(taskCommentFormService, 'getTaskComment').mockReturnValue({ id: null });
      jest.spyOn(taskCommentService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ taskComment: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: taskComment }));
      saveSubject.complete();

      // THEN
      expect(taskCommentFormService.getTaskComment).toHaveBeenCalled();
      expect(taskCommentService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITaskComment>>();
      const taskComment = { id: 17531 };
      jest.spyOn(taskCommentService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ taskComment });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(taskCommentService.update).toHaveBeenCalled();
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

    describe('compareEmployee', () => {
      it('should forward to employeeService', () => {
        const entity = { id: 1749 };
        const entity2 = { id: 1545 };
        jest.spyOn(employeeService, 'compareEmployee');
        comp.compareEmployee(entity, entity2);
        expect(employeeService.compareEmployee).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
