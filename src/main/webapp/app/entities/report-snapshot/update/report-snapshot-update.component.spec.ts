import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';
import { ReportSnapshotService } from '../service/report-snapshot.service';
import { IReportSnapshot } from '../report-snapshot.model';
import { ReportSnapshotFormService } from './report-snapshot-form.service';

import { ReportSnapshotUpdateComponent } from './report-snapshot-update.component';

describe('ReportSnapshot Management Update Component', () => {
  let comp: ReportSnapshotUpdateComponent;
  let fixture: ComponentFixture<ReportSnapshotUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let reportSnapshotFormService: ReportSnapshotFormService;
  let reportSnapshotService: ReportSnapshotService;
  let projectService: ProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReportSnapshotUpdateComponent],
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
      .overrideTemplate(ReportSnapshotUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ReportSnapshotUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    reportSnapshotFormService = TestBed.inject(ReportSnapshotFormService);
    reportSnapshotService = TestBed.inject(ReportSnapshotService);
    projectService = TestBed.inject(ProjectService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Project query and add missing value', () => {
      const reportSnapshot: IReportSnapshot = { id: 32515 };
      const project: IProject = { id: 10300 };
      reportSnapshot.project = project;

      const projectCollection: IProject[] = [{ id: 10300 }];
      jest.spyOn(projectService, 'query').mockReturnValue(of(new HttpResponse({ body: projectCollection })));
      const additionalProjects = [project];
      const expectedCollection: IProject[] = [...additionalProjects, ...projectCollection];
      jest.spyOn(projectService, 'addProjectToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ reportSnapshot });
      comp.ngOnInit();

      expect(projectService.query).toHaveBeenCalled();
      expect(projectService.addProjectToCollectionIfMissing).toHaveBeenCalledWith(
        projectCollection,
        ...additionalProjects.map(expect.objectContaining),
      );
      expect(comp.projectsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const reportSnapshot: IReportSnapshot = { id: 32515 };
      const project: IProject = { id: 10300 };
      reportSnapshot.project = project;

      activatedRoute.data = of({ reportSnapshot });
      comp.ngOnInit();

      expect(comp.projectsSharedCollection).toContainEqual(project);
      expect(comp.reportSnapshot).toEqual(reportSnapshot);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IReportSnapshot>>();
      const reportSnapshot = { id: 16840 };
      jest.spyOn(reportSnapshotFormService, 'getReportSnapshot').mockReturnValue(reportSnapshot);
      jest.spyOn(reportSnapshotService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ reportSnapshot });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: reportSnapshot }));
      saveSubject.complete();

      // THEN
      expect(reportSnapshotFormService.getReportSnapshot).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(reportSnapshotService.update).toHaveBeenCalledWith(expect.objectContaining(reportSnapshot));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IReportSnapshot>>();
      const reportSnapshot = { id: 16840 };
      jest.spyOn(reportSnapshotFormService, 'getReportSnapshot').mockReturnValue({ id: null });
      jest.spyOn(reportSnapshotService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ reportSnapshot: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: reportSnapshot }));
      saveSubject.complete();

      // THEN
      expect(reportSnapshotFormService.getReportSnapshot).toHaveBeenCalled();
      expect(reportSnapshotService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IReportSnapshot>>();
      const reportSnapshot = { id: 16840 };
      jest.spyOn(reportSnapshotService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ reportSnapshot });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(reportSnapshotService.update).toHaveBeenCalled();
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
  });
});
