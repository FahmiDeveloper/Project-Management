import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IChecklist } from 'app/entities/checklist/checklist.model';
import { ChecklistService } from 'app/entities/checklist/service/checklist.service';
import { ChecklistItemService } from '../service/checklist-item.service';
import { IChecklistItem } from '../checklist-item.model';
import { ChecklistItemFormService } from './checklist-item-form.service';

import { ChecklistItemUpdateComponent } from './checklist-item-update.component';

describe('ChecklistItem Management Update Component', () => {
  let comp: ChecklistItemUpdateComponent;
  let fixture: ComponentFixture<ChecklistItemUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let checklistItemFormService: ChecklistItemFormService;
  let checklistItemService: ChecklistItemService;
  let checklistService: ChecklistService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChecklistItemUpdateComponent],
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
      .overrideTemplate(ChecklistItemUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ChecklistItemUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    checklistItemFormService = TestBed.inject(ChecklistItemFormService);
    checklistItemService = TestBed.inject(ChecklistItemService);
    checklistService = TestBed.inject(ChecklistService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Checklist query and add missing value', () => {
      const checklistItem: IChecklistItem = { id: 5519 };
      const checklist: IChecklist = { id: 14950 };
      checklistItem.checklist = checklist;

      const checklistCollection: IChecklist[] = [{ id: 14950 }];
      jest.spyOn(checklistService, 'query').mockReturnValue(of(new HttpResponse({ body: checklistCollection })));
      const additionalChecklists = [checklist];
      const expectedCollection: IChecklist[] = [...additionalChecklists, ...checklistCollection];
      jest.spyOn(checklistService, 'addChecklistToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ checklistItem });
      comp.ngOnInit();

      expect(checklistService.query).toHaveBeenCalled();
      expect(checklistService.addChecklistToCollectionIfMissing).toHaveBeenCalledWith(
        checklistCollection,
        ...additionalChecklists.map(expect.objectContaining),
      );
      expect(comp.checklistsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const checklistItem: IChecklistItem = { id: 5519 };
      const checklist: IChecklist = { id: 14950 };
      checklistItem.checklist = checklist;

      activatedRoute.data = of({ checklistItem });
      comp.ngOnInit();

      expect(comp.checklistsSharedCollection).toContainEqual(checklist);
      expect(comp.checklistItem).toEqual(checklistItem);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChecklistItem>>();
      const checklistItem = { id: 474 };
      jest.spyOn(checklistItemFormService, 'getChecklistItem').mockReturnValue(checklistItem);
      jest.spyOn(checklistItemService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ checklistItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: checklistItem }));
      saveSubject.complete();

      // THEN
      expect(checklistItemFormService.getChecklistItem).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(checklistItemService.update).toHaveBeenCalledWith(expect.objectContaining(checklistItem));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChecklistItem>>();
      const checklistItem = { id: 474 };
      jest.spyOn(checklistItemFormService, 'getChecklistItem').mockReturnValue({ id: null });
      jest.spyOn(checklistItemService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ checklistItem: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: checklistItem }));
      saveSubject.complete();

      // THEN
      expect(checklistItemFormService.getChecklistItem).toHaveBeenCalled();
      expect(checklistItemService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChecklistItem>>();
      const checklistItem = { id: 474 };
      jest.spyOn(checklistItemService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ checklistItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(checklistItemService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareChecklist', () => {
      it('should forward to checklistService', () => {
        const entity = { id: 14950 };
        const entity2 = { id: 15108 };
        jest.spyOn(checklistService, 'compareChecklist');
        comp.compareChecklist(entity, entity2);
        expect(checklistService.compareChecklist).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
