import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ITimeEntry } from '../time-entry.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../time-entry.test-samples';

import { RestTimeEntry, TimeEntryService } from './time-entry.service';

const requireRestSample: RestTimeEntry = {
  ...sampleWithRequiredData,
  startTime: sampleWithRequiredData.startTime?.toJSON(),
  endTime: sampleWithRequiredData.endTime?.toJSON(),
  entryDate: sampleWithRequiredData.entryDate?.format(DATE_FORMAT),
};

describe('TimeEntry Service', () => {
  let service: TimeEntryService;
  let httpMock: HttpTestingController;
  let expectedResult: ITimeEntry | ITimeEntry[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TimeEntryService);
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

    it('should create a TimeEntry', () => {
      const timeEntry = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(timeEntry).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TimeEntry', () => {
      const timeEntry = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(timeEntry).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TimeEntry', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TimeEntry', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a TimeEntry', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTimeEntryToCollectionIfMissing', () => {
      it('should add a TimeEntry to an empty array', () => {
        const timeEntry: ITimeEntry = sampleWithRequiredData;
        expectedResult = service.addTimeEntryToCollectionIfMissing([], timeEntry);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(timeEntry);
      });

      it('should not add a TimeEntry to an array that contains it', () => {
        const timeEntry: ITimeEntry = sampleWithRequiredData;
        const timeEntryCollection: ITimeEntry[] = [
          {
            ...timeEntry,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTimeEntryToCollectionIfMissing(timeEntryCollection, timeEntry);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TimeEntry to an array that doesn't contain it", () => {
        const timeEntry: ITimeEntry = sampleWithRequiredData;
        const timeEntryCollection: ITimeEntry[] = [sampleWithPartialData];
        expectedResult = service.addTimeEntryToCollectionIfMissing(timeEntryCollection, timeEntry);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(timeEntry);
      });

      it('should add only unique TimeEntry to an array', () => {
        const timeEntryArray: ITimeEntry[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const timeEntryCollection: ITimeEntry[] = [sampleWithRequiredData];
        expectedResult = service.addTimeEntryToCollectionIfMissing(timeEntryCollection, ...timeEntryArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const timeEntry: ITimeEntry = sampleWithRequiredData;
        const timeEntry2: ITimeEntry = sampleWithPartialData;
        expectedResult = service.addTimeEntryToCollectionIfMissing([], timeEntry, timeEntry2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(timeEntry);
        expect(expectedResult).toContain(timeEntry2);
      });

      it('should accept null and undefined values', () => {
        const timeEntry: ITimeEntry = sampleWithRequiredData;
        expectedResult = service.addTimeEntryToCollectionIfMissing([], null, timeEntry, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(timeEntry);
      });

      it('should return initial array if no TimeEntry is added', () => {
        const timeEntryCollection: ITimeEntry[] = [sampleWithRequiredData];
        expectedResult = service.addTimeEntryToCollectionIfMissing(timeEntryCollection, undefined, null);
        expect(expectedResult).toEqual(timeEntryCollection);
      });
    });

    describe('compareTimeEntry', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTimeEntry(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 25946 };
        const entity2 = null;

        const compareResult1 = service.compareTimeEntry(entity1, entity2);
        const compareResult2 = service.compareTimeEntry(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 25946 };
        const entity2 = { id: 25006 };

        const compareResult1 = service.compareTimeEntry(entity1, entity2);
        const compareResult2 = service.compareTimeEntry(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 25946 };
        const entity2 = { id: 25946 };

        const compareResult1 = service.compareTimeEntry(entity1, entity2);
        const compareResult2 = service.compareTimeEntry(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
