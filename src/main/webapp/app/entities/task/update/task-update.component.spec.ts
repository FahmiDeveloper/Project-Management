import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ISprint } from 'app/entities/sprint/sprint.model';
import { SprintService } from 'app/entities/sprint/service/sprint.service';
import { IMilestone } from 'app/entities/milestone/milestone.model';
import { MilestoneService } from 'app/entities/milestone/service/milestone.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ITask } from '../task.model';
import { TaskService } from '../service/task.service';
import { TaskFormService } from './task-form.service';

import { TaskUpdateComponent } from './task-update.component';

describe('Task Management Update Component', () => {
  let comp: TaskUpdateComponent;
  let fixture: ComponentFixture<TaskUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let taskFormService: TaskFormService;
  let taskService: TaskService;
  let sprintService: SprintService;
  let milestoneService: MilestoneService;
  let employeeService: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskUpdateComponent],
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
      .overrideTemplate(TaskUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TaskUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    taskFormService = TestBed.inject(TaskFormService);
    taskService = TestBed.inject(TaskService);
    sprintService = TestBed.inject(SprintService);
    milestoneService = TestBed.inject(MilestoneService);
    employeeService = TestBed.inject(EmployeeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Sprint query and add missing value', () => {
      const task: ITask = { id: 22244 };
      const sprint: ISprint = { id: 19154 };
      task.sprint = sprint;

      const sprintCollection: ISprint[] = [{ id: 19154 }];
      jest.spyOn(sprintService, 'query').mockReturnValue(of(new HttpResponse({ body: sprintCollection })));
      const additionalSprints = [sprint];
      const expectedCollection: ISprint[] = [...additionalSprints, ...sprintCollection];
      jest.spyOn(sprintService, 'addSprintToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ task });
      comp.ngOnInit();

      expect(sprintService.query).toHaveBeenCalled();
      expect(sprintService.addSprintToCollectionIfMissing).toHaveBeenCalledWith(
        sprintCollection,
        ...additionalSprints.map(expect.objectContaining),
      );
      expect(comp.sprintsSharedCollection).toEqual(expectedCollection);
    });

    it('should call Milestone query and add missing value', () => {
      const task: ITask = { id: 22244 };
      const milestone: IMilestone = { id: 27104 };
      task.milestone = milestone;

      const milestoneCollection: IMilestone[] = [{ id: 27104 }];
      jest.spyOn(milestoneService, 'query').mockReturnValue(of(new HttpResponse({ body: milestoneCollection })));
      const additionalMilestones = [milestone];
      const expectedCollection: IMilestone[] = [...additionalMilestones, ...milestoneCollection];
      jest.spyOn(milestoneService, 'addMilestoneToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ task });
      comp.ngOnInit();

      expect(milestoneService.query).toHaveBeenCalled();
      expect(milestoneService.addMilestoneToCollectionIfMissing).toHaveBeenCalledWith(
        milestoneCollection,
        ...additionalMilestones.map(expect.objectContaining),
      );
      expect(comp.milestonesSharedCollection).toEqual(expectedCollection);
    });

    it('should call Employee query and add missing value', () => {
      const task: ITask = { id: 22244 };
      const assignedTo: IEmployee = { id: 1749 };
      task.assignedTo = assignedTo;
      const createdBy: IEmployee = { id: 1749 };
      task.createdBy = createdBy;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [assignedTo, createdBy];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ task });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const task: ITask = { id: 22244 };
      const sprint: ISprint = { id: 19154 };
      task.sprint = sprint;
      const milestone: IMilestone = { id: 27104 };
      task.milestone = milestone;
      const assignedTo: IEmployee = { id: 1749 };
      task.assignedTo = assignedTo;
      const createdBy: IEmployee = { id: 1749 };
      task.createdBy = createdBy;

      activatedRoute.data = of({ task });
      comp.ngOnInit();

      expect(comp.sprintsSharedCollection).toContainEqual(sprint);
      expect(comp.milestonesSharedCollection).toContainEqual(milestone);
      expect(comp.employeesSharedCollection).toContainEqual(assignedTo);
      expect(comp.employeesSharedCollection).toContainEqual(createdBy);
      expect(comp.task).toEqual(task);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITask>>();
      const task = { id: 25192 };
      jest.spyOn(taskFormService, 'getTask').mockReturnValue(task);
      jest.spyOn(taskService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ task });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: task }));
      saveSubject.complete();

      // THEN
      expect(taskFormService.getTask).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(taskService.update).toHaveBeenCalledWith(expect.objectContaining(task));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITask>>();
      const task = { id: 25192 };
      jest.spyOn(taskFormService, 'getTask').mockReturnValue({ id: null });
      jest.spyOn(taskService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ task: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: task }));
      saveSubject.complete();

      // THEN
      expect(taskFormService.getTask).toHaveBeenCalled();
      expect(taskService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITask>>();
      const task = { id: 25192 };
      jest.spyOn(taskService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ task });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(taskService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareSprint', () => {
      it('should forward to sprintService', () => {
        const entity = { id: 19154 };
        const entity2 = { id: 28936 };
        jest.spyOn(sprintService, 'compareSprint');
        comp.compareSprint(entity, entity2);
        expect(sprintService.compareSprint).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareMilestone', () => {
      it('should forward to milestoneService', () => {
        const entity = { id: 27104 };
        const entity2 = { id: 18822 };
        jest.spyOn(milestoneService, 'compareMilestone');
        comp.compareMilestone(entity, entity2);
        expect(milestoneService.compareMilestone).toHaveBeenCalledWith(entity, entity2);
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
