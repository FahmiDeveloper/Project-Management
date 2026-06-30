import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';
import { IDashboard } from '../dashboard.model';
import { DashboardService } from '../service/dashboard.service';
import { DashboardFormService } from './dashboard-form.service';

import { DashboardUpdateComponent } from './dashboard-update.component';

describe('Dashboard Management Update Component', () => {
  let comp: DashboardUpdateComponent;
  let fixture: ComponentFixture<DashboardUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let dashboardFormService: DashboardFormService;
  let dashboardService: DashboardService;
  let employeeService: EmployeeService;
  let projectService: ProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardUpdateComponent],
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
      .overrideTemplate(DashboardUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DashboardUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    dashboardFormService = TestBed.inject(DashboardFormService);
    dashboardService = TestBed.inject(DashboardService);
    employeeService = TestBed.inject(EmployeeService);
    projectService = TestBed.inject(ProjectService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Employee query and add missing value', () => {
      const dashboard: IDashboard = { id: 21947 };
      const employee: IEmployee = { id: 1749 };
      dashboard.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ dashboard });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should call Project query and add missing value', () => {
      const dashboard: IDashboard = { id: 21947 };
      const project: IProject = { id: 10300 };
      dashboard.project = project;

      const projectCollection: IProject[] = [{ id: 10300 }];
      jest.spyOn(projectService, 'query').mockReturnValue(of(new HttpResponse({ body: projectCollection })));
      const additionalProjects = [project];
      const expectedCollection: IProject[] = [...additionalProjects, ...projectCollection];
      jest.spyOn(projectService, 'addProjectToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ dashboard });
      comp.ngOnInit();

      expect(projectService.query).toHaveBeenCalled();
      expect(projectService.addProjectToCollectionIfMissing).toHaveBeenCalledWith(
        projectCollection,
        ...additionalProjects.map(expect.objectContaining),
      );
      expect(comp.projectsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const dashboard: IDashboard = { id: 21947 };
      const employee: IEmployee = { id: 1749 };
      dashboard.employee = employee;
      const project: IProject = { id: 10300 };
      dashboard.project = project;

      activatedRoute.data = of({ dashboard });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.projectsSharedCollection).toContainEqual(project);
      expect(comp.dashboard).toEqual(dashboard);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDashboard>>();
      const dashboard = { id: 22202 };
      jest.spyOn(dashboardFormService, 'getDashboard').mockReturnValue(dashboard);
      jest.spyOn(dashboardService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ dashboard });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: dashboard }));
      saveSubject.complete();

      // THEN
      expect(dashboardFormService.getDashboard).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(dashboardService.update).toHaveBeenCalledWith(expect.objectContaining(dashboard));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDashboard>>();
      const dashboard = { id: 22202 };
      jest.spyOn(dashboardFormService, 'getDashboard').mockReturnValue({ id: null });
      jest.spyOn(dashboardService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ dashboard: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: dashboard }));
      saveSubject.complete();

      // THEN
      expect(dashboardFormService.getDashboard).toHaveBeenCalled();
      expect(dashboardService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDashboard>>();
      const dashboard = { id: 22202 };
      jest.spyOn(dashboardService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ dashboard });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(dashboardService.update).toHaveBeenCalled();
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

    describe('compareProject', () => {
      it('should forward to projectService', () => {
        const entity = { id: 10300 };
        const entity2 = { id: 3319 };
        jest.spyOn(projectService, 'compareProject');
        comp.compareProject(entity, entity2);
        expect(projectService.compareProject).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
