import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IChecklistItem } from '../checklist-item.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../checklist-item.test-samples';

import { ChecklistItemService } from './checklist-item.service';

const requireRestSample: IChecklistItem = {
  ...sampleWithRequiredData,
};

describe('ChecklistItem Service', () => {
  let service: ChecklistItemService;
  let httpMock: HttpTestingController;
  let expectedResult: IChecklistItem | IChecklistItem[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ChecklistItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a ChecklistItem', () => {
      const checklistItem = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(checklistItem).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ChecklistItem', () => {
      const checklistItem = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(checklistItem).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ChecklistItem', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ChecklistItem', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ChecklistItem', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addChecklistItemToCollectionIfMissing', () => {
      it('should add a ChecklistItem to an empty array', () => {
        const checklistItem: IChecklistItem = sampleWithRequiredData;
        expectedResult = service.addChecklistItemToCollectionIfMissing([], checklistItem);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(checklistItem);
      });

      it('should not add a ChecklistItem to an array that contains it', () => {
        const checklistItem: IChecklistItem = sampleWithRequiredData;
        const checklistItemCollection: IChecklistItem[] = [
          {
            ...checklistItem,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addChecklistItemToCollectionIfMissing(checklistItemCollection, checklistItem);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ChecklistItem to an array that doesn't contain it", () => {
        const checklistItem: IChecklistItem = sampleWithRequiredData;
        const checklistItemCollection: IChecklistItem[] = [sampleWithPartialData];
        expectedResult = service.addChecklistItemToCollectionIfMissing(checklistItemCollection, checklistItem);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(checklistItem);
      });

      it('should add only unique ChecklistItem to an array', () => {
        const checklistItemArray: IChecklistItem[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const checklistItemCollection: IChecklistItem[] = [sampleWithRequiredData];
        expectedResult = service.addChecklistItemToCollectionIfMissing(checklistItemCollection, ...checklistItemArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const checklistItem: IChecklistItem = sampleWithRequiredData;
        const checklistItem2: IChecklistItem = sampleWithPartialData;
        expectedResult = service.addChecklistItemToCollectionIfMissing([], checklistItem, checklistItem2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(checklistItem);
        expect(expectedResult).toContain(checklistItem2);
      });

      it('should accept null and undefined values', () => {
        const checklistItem: IChecklistItem = sampleWithRequiredData;
        expectedResult = service.addChecklistItemToCollectionIfMissing([], null, checklistItem, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(checklistItem);
      });

      it('should return initial array if no ChecklistItem is added', () => {
        const checklistItemCollection: IChecklistItem[] = [sampleWithRequiredData];
        expectedResult = service.addChecklistItemToCollectionIfMissing(checklistItemCollection, undefined, null);
        expect(expectedResult).toEqual(checklistItemCollection);
      });
    });

    describe('compareChecklistItem', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareChecklistItem(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 474 };
        const entity2 = null;

        const compareResult1 = service.compareChecklistItem(entity1, entity2);
        const compareResult2 = service.compareChecklistItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 474 };
        const entity2 = { id: 5519 };

        const compareResult1 = service.compareChecklistItem(entity1, entity2);
        const compareResult2 = service.compareChecklistItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 474 };
        const entity2 = { id: 474 };

        const compareResult1 = service.compareChecklistItem(entity1, entity2);
        const compareResult2 = service.compareChecklistItem(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
