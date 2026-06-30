import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../report-snapshot.test-samples';

import { ReportSnapshotFormService } from './report-snapshot-form.service';

describe('ReportSnapshot Form Service', () => {
  let service: ReportSnapshotFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportSnapshotFormService);
  });

  describe('Service methods', () => {
    describe('createReportSnapshotFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createReportSnapshotFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            type: expect.any(Object),
            generatedDate: expect.any(Object),
            data: expect.any(Object),
            project: expect.any(Object),
          }),
        );
      });

      it('passing IReportSnapshot should create a new form with FormGroup', () => {
        const formGroup = service.createReportSnapshotFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            type: expect.any(Object),
            generatedDate: expect.any(Object),
            data: expect.any(Object),
            project: expect.any(Object),
          }),
        );
      });
    });

    describe('getReportSnapshot', () => {
      it('should return NewReportSnapshot for default ReportSnapshot initial value', () => {
        const formGroup = service.createReportSnapshotFormGroup(sampleWithNewData);

        const reportSnapshot = service.getReportSnapshot(formGroup) as any;

        expect(reportSnapshot).toMatchObject(sampleWithNewData);
      });

      it('should return NewReportSnapshot for empty ReportSnapshot initial value', () => {
        const formGroup = service.createReportSnapshotFormGroup();

        const reportSnapshot = service.getReportSnapshot(formGroup) as any;

        expect(reportSnapshot).toMatchObject({});
      });

      it('should return IReportSnapshot', () => {
        const formGroup = service.createReportSnapshotFormGroup(sampleWithRequiredData);

        const reportSnapshot = service.getReportSnapshot(formGroup) as any;

        expect(reportSnapshot).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IReportSnapshot should not enable id FormControl', () => {
        const formGroup = service.createReportSnapshotFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewReportSnapshot should disable id FormControl', () => {
        const formGroup = service.createReportSnapshotFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
