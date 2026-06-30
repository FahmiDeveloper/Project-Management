import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { ChecklistDetailComponent } from './checklist-detail.component';

describe('Checklist Management Detail Component', () => {
  let comp: ChecklistDetailComponent;
  let fixture: ComponentFixture<ChecklistDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./checklist-detail.component').then(m => m.ChecklistDetailComponent),
              resolve: { checklist: () => of({ id: 14950 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(ChecklistDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load checklist on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', ChecklistDetailComponent);

      // THEN
      expect(instance.checklist()).toEqual(expect.objectContaining({ id: 14950 }));
    });
  });

  describe('PreviousState', () => {
    it('should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
