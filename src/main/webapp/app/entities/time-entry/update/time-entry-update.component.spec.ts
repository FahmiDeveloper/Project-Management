import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ITask } from 'app/entities/task/task.model';
import { TaskService } from 'app/entities/task/service/task.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ITimeEntry } from '../time-entry.model';
import { TimeEntryService } from '../service/time-entry.service';
import { TimeEntryFormService } from './time-entry-form.service';

import { TimeEntryUpdateComponent } from './time-entry-update.component';

describe('TimeEntry Management Update Component', () => {
  let comp: TimeEntryUpdateComponent;
  let fixture: ComponentFixture<TimeEntryUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let timeEntryFormService: TimeEntryFormService;
  let timeEntryService: TimeEntryService;
  let taskService: TaskService;
  let employeeService: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TimeEntryUpdateComponent],
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
      .overrideTemplate(TimeEntryUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TimeEntryUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    timeEntryFormService = TestBed.inject(TimeEntryFormService);
    timeEntryService = TestBed.inject(TimeEntryService);
    taskService = TestBed.inject(TaskService);
    employeeService = TestBed.inject(EmployeeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Task query and add missing value', () => {
      const timeEntry: ITimeEntry = { id: 25006 };
      const task: ITask = { id: 25192 };
      timeEntry.task = task;

      const taskCollection: ITask[] = [{ id: 25192 }];
      jest.spyOn(taskService, 'query').mockReturnValue(of(new HttpResponse({ body: taskCollection })));
      const additionalTasks = [task];
      const expectedCollection: ITask[] = [...additionalTasks, ...taskCollection];
      jest.spyOn(taskService, 'addTaskToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      expect(taskService.query).toHaveBeenCalled();
      expect(taskService.addTaskToCollectionIfMissing).toHaveBeenCalledWith(
        taskCollection,
        ...additionalTasks.map(expect.objectContaining),
      );
      expect(comp.tasksSharedCollection).toEqual(expectedCollection);
    });

    it('should call Employee query and add missing value', () => {
      const timeEntry: ITimeEntry = { id: 25006 };
      const employee: IEmployee = { id: 1749 };
      timeEntry.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const timeEntry: ITimeEntry = { id: 25006 };
      const task: ITask = { id: 25192 };
      timeEntry.task = task;
      const employee: IEmployee = { id: 1749 };
      timeEntry.employee = employee;

      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      expect(comp.tasksSharedCollection).toContainEqual(task);
      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.timeEntry).toEqual(timeEntry);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeEntry>>();
      const timeEntry = { id: 25946 };
      jest.spyOn(timeEntryFormService, 'getTimeEntry').mockReturnValue(timeEntry);
      jest.spyOn(timeEntryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: timeEntry }));
      saveSubject.complete();

      // THEN
      expect(timeEntryFormService.getTimeEntry).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(timeEntryService.update).toHaveBeenCalledWith(expect.objectContaining(timeEntry));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeEntry>>();
      const timeEntry = { id: 25946 };
      jest.spyOn(timeEntryFormService, 'getTimeEntry').mockReturnValue({ id: null });
      jest.spyOn(timeEntryService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeEntry: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: timeEntry }));
      saveSubject.complete();

      // THEN
      expect(timeEntryFormService.getTimeEntry).toHaveBeenCalled();
      expect(timeEntryService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeEntry>>();
      const timeEntry = { id: 25946 };
      jest.spyOn(timeEntryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(timeEntryService.update).toHaveBeenCalled();
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
