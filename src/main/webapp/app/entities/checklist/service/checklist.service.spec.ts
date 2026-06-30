import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IChecklist } from '../checklist.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../checklist.test-samples';

import { ChecklistService, RestChecklist } from './checklist.service';

const requireRestSample: RestChecklist = {
  ...sampleWithRequiredData,
  createdDate: sampleWithRequiredData.createdDate?.toJSON(),
};

describe('Checklist Service', () => {
  let service: ChecklistService;
  let httpMock: HttpTestingController;
  let expectedResult: IChecklist | IChecklist[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ChecklistService);
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

    it('should create a Checklist', () => {
      const checklist = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(checklist).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Checklist', () => {
      const checklist = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(checklist).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Checklist', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Checklist', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Checklist', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addChecklistToCollectionIfMissing', () => {
      it('should add a Checklist to an empty array', () => {
        const checklist: IChecklist = sampleWithRequiredData;
        expectedResult = service.addChecklistToCollectionIfMissing([], checklist);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(checklist);
      });

      it('should not add a Checklist to an array that contains it', () => {
        const checklist: IChecklist = sampleWithRequiredData;
        const checklistCollection: IChecklist[] = [
          {
            ...checklist,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addChecklistToCollectionIfMissing(checklistCollection, checklist);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Checklist to an array that doesn't contain it", () => {
        const checklist: IChecklist = sampleWithRequiredData;
        const checklistCollection: IChecklist[] = [sampleWithPartialData];
        expectedResult = service.addChecklistToCollectionIfMissing(checklistCollection, checklist);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(checklist);
      });

      it('should add only unique Checklist to an array', () => {
        const checklistArray: IChecklist[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const checklistCollection: IChecklist[] = [sampleWithRequiredData];
        expectedResult = service.addChecklistToCollectionIfMissing(checklistCollection, ...checklistArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const checklist: IChecklist = sampleWithRequiredData;
        const checklist2: IChecklist = sampleWithPartialData;
        expectedResult = service.addChecklistToCollectionIfMissing([], checklist, checklist2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(checklist);
        expect(expectedResult).toContain(checklist2);
      });

      it('should accept null and undefined values', () => {
        const checklist: IChecklist = sampleWithRequiredData;
        expectedResult = service.addChecklistToCollectionIfMissing([], null, checklist, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(checklist);
      });

      it('should return initial array if no Checklist is added', () => {
        const checklistCollection: IChecklist[] = [sampleWithRequiredData];
        expectedResult = service.addChecklistToCollectionIfMissing(checklistCollection, undefined, null);
        expect(expectedResult).toEqual(checklistCollection);
      });
    });

    describe('compareChecklist', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareChecklist(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 14950 };
        const entity2 = null;

        const compareResult1 = service.compareChecklist(entity1, entity2);
        const compareResult2 = service.compareChecklist(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 14950 };
        const entity2 = { id: 15108 };

        const compareResult1 = service.compareChecklist(entity1, entity2);
        const compareResult2 = service.compareChecklist(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 14950 };
        const entity2 = { id: 14950 };

        const compareResult1 = service.compareChecklist(entity1, entity2);
        const compareResult2 = service.compareChecklist(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
