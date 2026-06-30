import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IActivityLog, NewActivityLog } from '../activity-log.model';

export type PartialUpdateActivityLog = Partial<IActivityLog> & Pick<IActivityLog, 'id'>;

type RestOf<T extends IActivityLog | NewActivityLog> = Omit<T, 'createdDate'> & {
  createdDate?: string | null;
};

export type RestActivityLog = RestOf<IActivityLog>;

export type NewRestActivityLog = RestOf<NewActivityLog>;

export type PartialUpdateRestActivityLog = RestOf<PartialUpdateActivityLog>;

export type EntityResponseType = HttpResponse<IActivityLog>;
export type EntityArrayResponseType = HttpResponse<IActivityLog[]>;

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/activity-logs');

  create(activityLog: NewActivityLog): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(activityLog);
    return this.http
      .post<RestActivityLog>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(activityLog: IActivityLog): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(activityLog);
    return this.http
      .put<RestActivityLog>(`${this.resourceUrl}/${this.getActivityLogIdentifier(activityLog)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(activityLog: PartialUpdateActivityLog): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(activityLog);
    return this.http
      .patch<RestActivityLog>(`${this.resourceUrl}/${this.getActivityLogIdentifier(activityLog)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestActivityLog>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestActivityLog[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getActivityLogIdentifier(activityLog: Pick<IActivityLog, 'id'>): number {
    return activityLog.id;
  }

  compareActivityLog(o1: Pick<IActivityLog, 'id'> | null, o2: Pick<IActivityLog, 'id'> | null): boolean {
    return o1 && o2 ? this.getActivityLogIdentifier(o1) === this.getActivityLogIdentifier(o2) : o1 === o2;
  }

  addActivityLogToCollectionIfMissing<Type extends Pick<IActivityLog, 'id'>>(
    activityLogCollection: Type[],
    ...activityLogsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const activityLogs: Type[] = activityLogsToCheck.filter(isPresent);
    if (activityLogs.length > 0) {
      const activityLogCollectionIdentifiers = activityLogCollection.map(activityLogItem => this.getActivityLogIdentifier(activityLogItem));
      const activityLogsToAdd = activityLogs.filter(activityLogItem => {
        const activityLogIdentifier = this.getActivityLogIdentifier(activityLogItem);
        if (activityLogCollectionIdentifiers.includes(activityLogIdentifier)) {
          return false;
        }
        activityLogCollectionIdentifiers.push(activityLogIdentifier);
        return true;
      });
      return [...activityLogsToAdd, ...activityLogCollection];
    }
    return activityLogCollection;
  }

  protected convertDateFromClient<T extends IActivityLog | NewActivityLog | PartialUpdateActivityLog>(activityLog: T): RestOf<T> {
    return {
      ...activityLog,
      createdDate: activityLog.createdDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restActivityLog: RestActivityLog): IActivityLog {
    return {
      ...restActivityLog,
      createdDate: restActivityLog.createdDate ? dayjs(restActivityLog.createdDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestActivityLog>): HttpResponse<IActivityLog> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestActivityLog[]>): HttpResponse<IActivityLog[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
