import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IReportSnapshot } from '../report-snapshot.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../report-snapshot.test-samples';

import { ReportSnapshotService, RestReportSnapshot } from './report-snapshot.service';

const requireRestSample: RestReportSnapshot = {
  ...sampleWithRequiredData,
  generatedDate: sampleWithRequiredData.generatedDate?.toJSON(),
};

describe('ReportSnapshot Service', () => {
  let service: ReportSnapshotService;
  let httpMock: HttpTestingController;
  let expectedResult: IReportSnapshot | IReportSnapshot[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ReportSnapshotService);
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

    it('should create a ReportSnapshot', () => {
      const reportSnapshot = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(reportSnapshot).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ReportSnapshot', () => {
      const reportSnapshot = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(reportSnapshot).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ReportSnapshot', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ReportSnapshot', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ReportSnapshot', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addReportSnapshotToCollectionIfMissing', () => {
      it('should add a ReportSnapshot to an empty array', () => {
        const reportSnapshot: IReportSnapshot = sampleWithRequiredData;
        expectedResult = service.addReportSnapshotToCollectionIfMissing([], reportSnapshot);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(reportSnapshot);
      });

      it('should not add a ReportSnapshot to an array that contains it', () => {
        const reportSnapshot: IReportSnapshot = sampleWithRequiredData;
        const reportSnapshotCollection: IReportSnapshot[] = [
          {
            ...reportSnapshot,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addReportSnapshotToCollectionIfMissing(reportSnapshotCollection, reportSnapshot);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ReportSnapshot to an array that doesn't contain it", () => {
        const reportSnapshot: IReportSnapshot = sampleWithRequiredData;
        const reportSnapshotCollection: IReportSnapshot[] = [sampleWithPartialData];
        expectedResult = service.addReportSnapshotToCollectionIfMissing(reportSnapshotCollection, reportSnapshot);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(reportSnapshot);
      });

      it('should add only unique ReportSnapshot to an array', () => {
        const reportSnapshotArray: IReportSnapshot[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const reportSnapshotCollection: IReportSnapshot[] = [sampleWithRequiredData];
        expectedResult = service.addReportSnapshotToCollectionIfMissing(reportSnapshotCollection, ...reportSnapshotArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const reportSnapshot: IReportSnapshot = sampleWithRequiredData;
        const reportSnapshot2: IReportSnapshot = sampleWithPartialData;
        expectedResult = service.addReportSnapshotToCollectionIfMissing([], reportSnapshot, reportSnapshot2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(reportSnapshot);
        expect(expectedResult).toContain(reportSnapshot2);
      });

      it('should accept null and undefined values', () => {
        const reportSnapshot: IReportSnapshot = sampleWithRequiredData;
        expectedResult = service.addReportSnapshotToCollectionIfMissing([], null, reportSnapshot, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(reportSnapshot);
      });

      it('should return initial array if no ReportSnapshot is added', () => {
        const reportSnapshotCollection: IReportSnapshot[] = [sampleWithRequiredData];
        expectedResult = service.addReportSnapshotToCollectionIfMissing(reportSnapshotCollection, undefined, null);
        expect(expectedResult).toEqual(reportSnapshotCollection);
      });
    });

    describe('compareReportSnapshot', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareReportSnapshot(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 16840 };
        const entity2 = null;

        const compareResult1 = service.compareReportSnapshot(entity1, entity2);
        const compareResult2 = service.compareReportSnapshot(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 16840 };
        const entity2 = { id: 32515 };

        const compareResult1 = service.compareReportSnapshot(entity1, entity2);
        const compareResult2 = service.compareReportSnapshot(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 16840 };
        const entity2 = { id: 16840 };

        const compareResult1 = service.compareReportSnapshot(entity1, entity2);
        const compareResult2 = service.compareReportSnapshot(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
