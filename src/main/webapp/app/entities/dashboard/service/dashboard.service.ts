import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IDashboard, NewDashboard } from '../dashboard.model';

export type PartialUpdateDashboard = Partial<IDashboard> & Pick<IDashboard, 'id'>;

type RestOf<T extends IDashboard | NewDashboard> = Omit<T, 'createdDate' | 'updatedDate'> & {
  createdDate?: string | null;
  updatedDate?: string | null;
};

export type RestDashboard = RestOf<IDashboard>;

export type NewRestDashboard = RestOf<NewDashboard>;

export type PartialUpdateRestDashboard = RestOf<PartialUpdateDashboard>;

export type EntityResponseType = HttpResponse<IDashboard>;
export type EntityArrayResponseType = HttpResponse<IDashboard[]>;

@Injectable({ providedIn: 'root' })
export class DashboardService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/dashboards');

  create(dashboard: NewDashboard): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(dashboard);
    return this.http
      .post<RestDashboard>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(dashboard: IDashboard): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(dashboard);
    return this.http
      .put<RestDashboard>(`${this.resourceUrl}/${this.getDashboardIdentifier(dashboard)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(dashboard: PartialUpdateDashboard): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(dashboard);
    return this.http
      .patch<RestDashboard>(`${this.resourceUrl}/${this.getDashboardIdentifier(dashboard)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestDashboard>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestDashboard[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getDashboardIdentifier(dashboard: Pick<IDashboard, 'id'>): number {
    return dashboard.id;
  }

  compareDashboard(o1: Pick<IDashboard, 'id'> | null, o2: Pick<IDashboard, 'id'> | null): boolean {
    return o1 && o2 ? this.getDashboardIdentifier(o1) === this.getDashboardIdentifier(o2) : o1 === o2;
  }

  addDashboardToCollectionIfMissing<Type extends Pick<IDashboard, 'id'>>(
    dashboardCollection: Type[],
    ...dashboardsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const dashboards: Type[] = dashboardsToCheck.filter(isPresent);
    if (dashboards.length > 0) {
      const dashboardCollectionIdentifiers = dashboardCollection.map(dashboardItem => this.getDashboardIdentifier(dashboardItem));
      const dashboardsToAdd = dashboards.filter(dashboardItem => {
        const dashboardIdentifier = this.getDashboardIdentifier(dashboardItem);
        if (dashboardCollectionIdentifiers.includes(dashboardIdentifier)) {
          return false;
        }
        dashboardCollectionIdentifiers.push(dashboardIdentifier);
        return true;
      });
      return [...dashboardsToAdd, ...dashboardCollection];
    }
    return dashboardCollection;
  }

  protected convertDateFromClient<T extends IDashboard | NewDashboard | PartialUpdateDashboard>(dashboard: T): RestOf<T> {
    return {
      ...dashboard,
      createdDate: dashboard.createdDate?.toJSON() ?? null,
      updatedDate: dashboard.updatedDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restDashboard: RestDashboard): IDashboard {
    return {
      ...restDashboard,
      createdDate: restDashboard.createdDate ? dayjs(restDashboard.createdDate) : undefined,
      updatedDate: restDashboard.updatedDate ? dayjs(restDashboard.updatedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestDashboard>): HttpResponse<IDashboard> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestDashboard[]>): HttpResponse<IDashboard[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
