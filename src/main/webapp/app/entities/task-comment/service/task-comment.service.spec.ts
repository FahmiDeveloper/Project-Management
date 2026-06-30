import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ITaskComment } from '../task-comment.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../task-comment.test-samples';

import { RestTaskComment, TaskCommentService } from './task-comment.service';

const requireRestSample: RestTaskComment = {
  ...sampleWithRequiredData,
  createdDate: sampleWithRequiredData.createdDate?.toJSON(),
};

describe('TaskComment Service', () => {
  let service: TaskCommentService;
  let httpMock: HttpTestingController;
  let expectedResult: ITaskComment | ITaskComment[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TaskCommentService);
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

    it('should create a TaskComment', () => {
      const taskComment = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(taskComment).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TaskComment', () => {
      const taskComment = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(taskComment).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TaskComment', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TaskComment', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a TaskComment', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTaskCommentToCollectionIfMissing', () => {
      it('should add a TaskComment to an empty array', () => {
        const taskComment: ITaskComment = sampleWithRequiredData;
        expectedResult = service.addTaskCommentToCollectionIfMissing([], taskComment);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(taskComment);
      });

      it('should not add a TaskComment to an array that contains it', () => {
        const taskComment: ITaskComment = sampleWithRequiredData;
        const taskCommentCollection: ITaskComment[] = [
          {
            ...taskComment,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTaskCommentToCollectionIfMissing(taskCommentCollection, taskComment);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TaskComment to an array that doesn't contain it", () => {
        const taskComment: ITaskComment = sampleWithRequiredData;
        const taskCommentCollection: ITaskComment[] = [sampleWithPartialData];
        expectedResult = service.addTaskCommentToCollectionIfMissing(taskCommentCollection, taskComment);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(taskComment);
      });

      it('should add only unique TaskComment to an array', () => {
        const taskCommentArray: ITaskComment[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const taskCommentCollection: ITaskComment[] = [sampleWithRequiredData];
        expectedResult = service.addTaskCommentToCollectionIfMissing(taskCommentCollection, ...taskCommentArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const taskComment: ITaskComment = sampleWithRequiredData;
        const taskComment2: ITaskComment = sampleWithPartialData;
        expectedResult = service.addTaskCommentToCollectionIfMissing([], taskComment, taskComment2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(taskComment);
        expect(expectedResult).toContain(taskComment2);
      });

      it('should accept null and undefined values', () => {
        const taskComment: ITaskComment = sampleWithRequiredData;
        expectedResult = service.addTaskCommentToCollectionIfMissing([], null, taskComment, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(taskComment);
      });

      it('should return initial array if no TaskComment is added', () => {
        const taskCommentCollection: ITaskComment[] = [sampleWithRequiredData];
        expectedResult = service.addTaskCommentToCollectionIfMissing(taskCommentCollection, undefined, null);
        expect(expectedResult).toEqual(taskCommentCollection);
      });
    });

    describe('compareTaskComment', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTaskComment(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 17531 };
        const entity2 = null;

        const compareResult1 = service.compareTaskComment(entity1, entity2);
        const compareResult2 = service.compareTaskComment(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 17531 };
        const entity2 = { id: 4650 };

        const compareResult1 = service.compareTaskComment(entity1, entity2);
        const compareResult2 = service.compareTaskComment(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 17531 };
        const entity2 = { id: 17531 };

        const compareResult1 = service.compareTaskComment(entity1, entity2);
        const compareResult2 = service.compareTaskComment(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
