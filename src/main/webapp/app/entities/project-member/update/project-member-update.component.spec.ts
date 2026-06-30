import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IProjectMember } from '../project-member.model';
import { ProjectMemberService } from '../service/project-member.service';
import { ProjectMemberFormService } from './project-member-form.service';

import { ProjectMemberUpdateComponent } from './project-member-update.component';

describe('ProjectMember Management Update Component', () => {
  let comp: ProjectMemberUpdateComponent;
  let fixture: ComponentFixture<ProjectMemberUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let projectMemberFormService: ProjectMemberFormService;
  let projectMemberService: ProjectMemberService;
  let projectService: ProjectService;
  let employeeService: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectMemberUpdateComponent],
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
      .overrideTemplate(ProjectMemberUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ProjectMemberUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    projectMemberFormService = TestBed.inject(ProjectMemberFormService);
    projectMemberService = TestBed.inject(ProjectMemberService);
    projectService = TestBed.inject(ProjectService);
    employeeService = TestBed.inject(EmployeeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Project query and add missing value', () => {
      const projectMember: IProjectMember = { id: 10319 };
      const project: IProject = { id: 10300 };
      projectMember.project = project;

      const projectCollection: IProject[] = [{ id: 10300 }];
      jest.spyOn(projectService, 'query').mockReturnValue(of(new HttpResponse({ body: projectCollection })));
      const additionalProjects = [project];
      const expectedCollection: IProject[] = [...additionalProjects, ...projectCollection];
      jest.spyOn(projectService, 'addProjectToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ projectMember });
      comp.ngOnInit();

      expect(projectService.query).toHaveBeenCalled();
      expect(projectService.addProjectToCollectionIfMissing).toHaveBeenCalledWith(
        projectCollection,
        ...additionalProjects.map(expect.objectContaining),
      );
      expect(comp.projectsSharedCollection).toEqual(expectedCollection);
    });

    it('should call Employee query and add missing value', () => {
      const projectMember: IProjectMember = { id: 10319 };
      const employee: IEmployee = { id: 1749 };
      projectMember.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ projectMember });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const projectMember: IProjectMember = { id: 10319 };
      const project: IProject = { id: 10300 };
      projectMember.project = project;
      const employee: IEmployee = { id: 1749 };
      projectMember.employee = employee;

      activatedRoute.data = of({ projectMember });
      comp.ngOnInit();

      expect(comp.projectsSharedCollection).toContainEqual(project);
      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.projectMember).toEqual(projectMember);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProjectMember>>();
      const projectMember = { id: 32506 };
      jest.spyOn(projectMemberFormService, 'getProjectMember').mockReturnValue(projectMember);
      jest.spyOn(projectMemberService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ projectMember });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: projectMember }));
      saveSubject.complete();

      // THEN
      expect(projectMemberFormService.getProjectMember).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(projectMemberService.update).toHaveBeenCalledWith(expect.objectContaining(projectMember));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProjectMember>>();
      const projectMember = { id: 32506 };
      jest.spyOn(projectMemberFormService, 'getProjectMember').mockReturnValue({ id: null });
      jest.spyOn(projectMemberService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ projectMember: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: projectMember }));
      saveSubject.complete();

      // THEN
      expect(projectMemberFormService.getProjectMember).toHaveBeenCalled();
      expect(projectMemberService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProjectMember>>();
      const projectMember = { id: 32506 };
      jest.spyOn(projectMemberService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ projectMember });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(projectMemberService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareProject', () => {
      it('should forward to projectService', () => {
        const entity = { id: 10300 };
        const entity2 = { id: 3319 };
        jest.spyOn(projectService, 'compareProject');
        comp.compareProject(entity, entity2);
        expect(projectService.compareProject).toHaveBeenCalledWith(entity, entity2);
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
