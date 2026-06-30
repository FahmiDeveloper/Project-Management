import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IReportSnapshot, NewReportSnapshot } from '../report-snapshot.model';

export type PartialUpdateReportSnapshot = Partial<IReportSnapshot> & Pick<IReportSnapshot, 'id'>;

type RestOf<T extends IReportSnapshot | NewReportSnapshot> = Omit<T, 'generatedDate'> & {
  generatedDate?: string | null;
};

export type RestReportSnapshot = RestOf<IReportSnapshot>;

export type NewRestReportSnapshot = RestOf<NewReportSnapshot>;

export type PartialUpdateRestReportSnapshot = RestOf<PartialUpdateReportSnapshot>;

export type EntityResponseType = HttpResponse<IReportSnapshot>;
export type EntityArrayResponseType = HttpResponse<IReportSnapshot[]>;

@Injectable({ providedIn: 'root' })
export class ReportSnapshotService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/report-snapshots');

  create(reportSnapshot: NewReportSnapshot): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(reportSnapshot);
    return this.http
      .post<RestReportSnapshot>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(reportSnapshot: IReportSnapshot): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(reportSnapshot);
    return this.http
      .put<RestReportSnapshot>(`${this.resourceUrl}/${this.getReportSnapshotIdentifier(reportSnapshot)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(reportSnapshot: PartialUpdateReportSnapshot): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(reportSnapshot);
    return this.http
      .patch<RestReportSnapshot>(`${this.resourceUrl}/${this.getReportSnapshotIdentifier(reportSnapshot)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestReportSnapshot>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestReportSnapshot[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getReportSnapshotIdentifier(reportSnapshot: Pick<IReportSnapshot, 'id'>): number {
    return reportSnapshot.id;
  }

  compareReportSnapshot(o1: Pick<IReportSnapshot, 'id'> | null, o2: Pick<IReportSnapshot, 'id'> | null): boolean {
    return o1 && o2 ? this.getReportSnapshotIdentifier(o1) === this.getReportSnapshotIdentifier(o2) : o1 === o2;
  }

  addReportSnapshotToCollectionIfMissing<Type extends Pick<IReportSnapshot, 'id'>>(
    reportSnapshotCollection: Type[],
    ...reportSnapshotsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const reportSnapshots: Type[] = reportSnapshotsToCheck.filter(isPresent);
    if (reportSnapshots.length > 0) {
      const reportSnapshotCollectionIdentifiers = reportSnapshotCollection.map(reportSnapshotItem =>
        this.getReportSnapshotIdentifier(reportSnapshotItem),
      );
      const reportSnapshotsToAdd = reportSnapshots.filter(reportSnapshotItem => {
        const reportSnapshotIdentifier = this.getReportSnapshotIdentifier(reportSnapshotItem);
        if (reportSnapshotCollectionIdentifiers.includes(reportSnapshotIdentifier)) {
          return false;
        }
        reportSnapshotCollectionIdentifiers.push(reportSnapshotIdentifier);
        return true;
      });
      return [...reportSnapshotsToAdd, ...reportSnapshotCollection];
    }
    return reportSnapshotCollection;
  }

  protected convertDateFromClient<T extends IReportSnapshot | NewReportSnapshot | PartialUpdateReportSnapshot>(
    reportSnapshot: T,
  ): RestOf<T> {
    return {
      ...reportSnapshot,
      generatedDate: reportSnapshot.generatedDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restReportSnapshot: RestReportSnapshot): IReportSnapshot {
    return {
      ...restReportSnapshot,
      generatedDate: restReportSnapshot.generatedDate ? dayjs(restReportSnapshot.generatedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestReportSnapshot>): HttpResponse<IReportSnapshot> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestReportSnapshot[]>): HttpResponse<IReportSnapshot[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
