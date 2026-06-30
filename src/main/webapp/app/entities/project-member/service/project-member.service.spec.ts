import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IProjectMember } from '../project-member.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../project-member.test-samples';

import { ProjectMemberService, RestProjectMember } from './project-member.service';

const requireRestSample: RestProjectMember = {
  ...sampleWithRequiredData,
  joinedDate: sampleWithRequiredData.joinedDate?.format(DATE_FORMAT),
};

describe('ProjectMember Service', () => {
  let service: ProjectMemberService;
  let httpMock: HttpTestingController;
  let expectedResult: IProjectMember | IProjectMember[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ProjectMemberService);
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

    it('should create a ProjectMember', () => {
      const projectMember = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(projectMember).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ProjectMember', () => {
      const projectMember = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(projectMember).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ProjectMember', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ProjectMember', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ProjectMember', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addProjectMemberToCollectionIfMissing', () => {
      it('should add a ProjectMember to an empty array', () => {
        const projectMember: IProjectMember = sampleWithRequiredData;
        expectedResult = service.addProjectMemberToCollectionIfMissing([], projectMember);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(projectMember);
      });

      it('should not add a ProjectMember to an array that contains it', () => {
        const projectMember: IProjectMember = sampleWithRequiredData;
        const projectMemberCollection: IProjectMember[] = [
          {
            ...projectMember,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addProjectMemberToCollectionIfMissing(projectMemberCollection, projectMember);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ProjectMember to an array that doesn't contain it", () => {
        const projectMember: IProjectMember = sampleWithRequiredData;
        const projectMemberCollection: IProjectMember[] = [sampleWithPartialData];
        expectedResult = service.addProjectMemberToCollectionIfMissing(projectMemberCollection, projectMember);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(projectMember);
      });

      it('should add only unique ProjectMember to an array', () => {
        const projectMemberArray: IProjectMember[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const projectMemberCollection: IProjectMember[] = [sampleWithRequiredData];
        expectedResult = service.addProjectMemberToCollectionIfMissing(projectMemberCollection, ...projectMemberArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const projectMember: IProjectMember = sampleWithRequiredData;
        const projectMember2: IProjectMember = sampleWithPartialData;
        expectedResult = service.addProjectMemberToCollectionIfMissing([], projectMember, projectMember2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(projectMember);
        expect(expectedResult).toContain(projectMember2);
      });

      it('should accept null and undefined values', () => {
        const projectMember: IProjectMember = sampleWithRequiredData;
        expectedResult = service.addProjectMemberToCollectionIfMissing([], null, projectMember, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(projectMember);
      });

      it('should return initial array if no ProjectMember is added', () => {
        const projectMemberCollection: IProjectMember[] = [sampleWithRequiredData];
        expectedResult = service.addProjectMemberToCollectionIfMissing(projectMemberCollection, undefined, null);
        expect(expectedResult).toEqual(projectMemberCollection);
      });
    });

    describe('compareProjectMember', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareProjectMember(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 32506 };
        const entity2 = null;

        const compareResult1 = service.compareProjectMember(entity1, entity2);
        const compareResult2 = service.compareProjectMember(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 32506 };
        const entity2 = { id: 10319 };

        const compareResult1 = service.compareProjectMember(entity1, entity2);
        const compareResult2 = service.compareProjectMember(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 32506 };
        const entity2 = { id: 32506 };

        const compareResult1 = service.compareProjectMember(entity1, entity2);
        const compareResult2 = service.compareProjectMember(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
