import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IReportSnapshot, NewReportSnapshot } from '../report-snapshot.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IReportSnapshot for edit and NewReportSnapshotFormGroupInput for create.
 */
type ReportSnapshotFormGroupInput = IReportSnapshot | PartialWithRequiredKeyOf<NewReportSnapshot>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IReportSnapshot | NewReportSnapshot> = Omit<T, 'generatedDate'> & {
  generatedDate?: string | null;
};

type ReportSnapshotFormRawValue = FormValueOf<IReportSnapshot>;

type NewReportSnapshotFormRawValue = FormValueOf<NewReportSnapshot>;

type ReportSnapshotFormDefaults = Pick<NewReportSnapshot, 'id' | 'generatedDate'>;

type ReportSnapshotFormGroupContent = {
  id: FormControl<ReportSnapshotFormRawValue['id'] | NewReportSnapshot['id']>;
  name: FormControl<ReportSnapshotFormRawValue['name']>;
  type: FormControl<ReportSnapshotFormRawValue['type']>;
  generatedDate: FormControl<ReportSnapshotFormRawValue['generatedDate']>;
  data: FormControl<ReportSnapshotFormRawValue['data']>;
  project: FormControl<ReportSnapshotFormRawValue['project']>;
};

export type ReportSnapshotFormGroup = FormGroup<ReportSnapshotFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ReportSnapshotFormService {
  createReportSnapshotFormGroup(reportSnapshot: ReportSnapshotFormGroupInput = { id: null }): ReportSnapshotFormGroup {
    const reportSnapshotRawValue = this.convertReportSnapshotToReportSnapshotRawValue({
      ...this.getFormDefaults(),
      ...reportSnapshot,
    });
    return new FormGroup<ReportSnapshotFormGroupContent>({
      id: new FormControl(
        { value: reportSnapshotRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(reportSnapshotRawValue.name, {
        validators: [Validators.required],
      }),
      type: new FormControl(reportSnapshotRawValue.type, {
        validators: [Validators.required],
      }),
      generatedDate: new FormControl(reportSnapshotRawValue.generatedDate, {
        validators: [Validators.required],
      }),
      data: new FormControl(reportSnapshotRawValue.data),
      project: new FormControl(reportSnapshotRawValue.project),
    });
  }

  getReportSnapshot(form: ReportSnapshotFormGroup): IReportSnapshot | NewReportSnapshot {
    return this.convertReportSnapshotRawValueToReportSnapshot(
      form.getRawValue() as ReportSnapshotFormRawValue | NewReportSnapshotFormRawValue,
    );
  }

  resetForm(form: ReportSnapshotFormGroup, reportSnapshot: ReportSnapshotFormGroupInput): void {
    const reportSnapshotRawValue = this.convertReportSnapshotToReportSnapshotRawValue({ ...this.getFormDefaults(), ...reportSnapshot });
    form.reset(
      {
        ...reportSnapshotRawValue,
        id: { value: reportSnapshotRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ReportSnapshotFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      generatedDate: currentTime,
    };
  }

  private convertReportSnapshotRawValueToReportSnapshot(
    rawReportSnapshot: ReportSnapshotFormRawValue | NewReportSnapshotFormRawValue,
  ): IReportSnapshot | NewReportSnapshot {
    return {
      ...rawReportSnapshot,
      generatedDate: dayjs(rawReportSnapshot.generatedDate, DATE_TIME_FORMAT),
    };
  }

  private convertReportSnapshotToReportSnapshotRawValue(
    reportSnapshot: IReportSnapshot | (Partial<NewReportSnapshot> & ReportSnapshotFormDefaults),
  ): ReportSnapshotFormRawValue | PartialWithRequiredKeyOf<NewReportSnapshotFormRawValue> {
    return {
      ...reportSnapshot,
      generatedDate: reportSnapshot.generatedDate ? reportSnapshot.generatedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
