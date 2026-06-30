import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ActivityLogService } from '../service/activity-log.service';
import { IActivityLog } from '../activity-log.model';
import { ActivityLogFormService } from './activity-log-form.service';

import { ActivityLogUpdateComponent } from './activity-log-update.component';

describe('ActivityLog Management Update Component', () => {
  let comp: ActivityLogUpdateComponent;
  let fixture: ComponentFixture<ActivityLogUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let activityLogFormService: ActivityLogFormService;
  let activityLogService: ActivityLogService;
  let employeeService: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ActivityLogUpdateComponent],
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
      .overrideTemplate(ActivityLogUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ActivityLogUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    activityLogFormService = TestBed.inject(ActivityLogFormService);
    activityLogService = TestBed.inject(ActivityLogService);
    employeeService = TestBed.inject(EmployeeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Employee query and add missing value', () => {
      const activityLog: IActivityLog = { id: 22052 };
      const employee: IEmployee = { id: 1749 };
      activityLog.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ activityLog });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const activityLog: IActivityLog = { id: 22052 };
      const employee: IEmployee = { id: 1749 };
      activityLog.employee = employee;

      activatedRoute.data = of({ activityLog });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.activityLog).toEqual(activityLog);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IActivityLog>>();
      const activityLog = { id: 27554 };
      jest.spyOn(activityLogFormService, 'getActivityLog').mockReturnValue(activityLog);
      jest.spyOn(activityLogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ activityLog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: activityLog }));
      saveSubject.complete();

      // THEN
      expect(activityLogFormService.getActivityLog).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(activityLogService.update).toHaveBeenCalledWith(expect.objectContaining(activityLog));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IActivityLog>>();
      const activityLog = { id: 27554 };
      jest.spyOn(activityLogFormService, 'getActivityLog').mockReturnValue({ id: null });
      jest.spyOn(activityLogService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ activityLog: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: activityLog }));
      saveSubject.complete();

      // THEN
      expect(activityLogFormService.getActivityLog).toHaveBeenCalled();
      expect(activityLogService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IActivityLog>>();
      const activityLog = { id: 27554 };
      jest.spyOn(activityLogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ activityLog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(activityLogService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
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
