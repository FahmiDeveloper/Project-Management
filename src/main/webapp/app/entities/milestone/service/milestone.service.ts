import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IMilestone, NewMilestone } from '../milestone.model';

export type PartialUpdateMilestone = Partial<IMilestone> & Pick<IMilestone, 'id'>;

type RestOf<T extends IMilestone | NewMilestone> = Omit<T, 'startDate' | 'dueDate'> & {
  startDate?: string | null;
  dueDate?: string | null;
};

export type RestMilestone = RestOf<IMilestone>;

export type NewRestMilestone = RestOf<NewMilestone>;

export type PartialUpdateRestMilestone = RestOf<PartialUpdateMilestone>;

export type EntityResponseType = HttpResponse<IMilestone>;
export type EntityArrayResponseType = HttpResponse<IMilestone[]>;

@Injectable({ providedIn: 'root' })
export class MilestoneService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/milestones');

  create(milestone: NewMilestone): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(milestone);
    return this.http
      .post<RestMilestone>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(milestone: IMilestone): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(milestone);
    return this.http
      .put<RestMilestone>(`${this.resourceUrl}/${this.getMilestoneIdentifier(milestone)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(milestone: PartialUpdateMilestone): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(milestone);
    return this.http
      .patch<RestMilestone>(`${this.resourceUrl}/${this.getMilestoneIdentifier(milestone)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestMilestone>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestMilestone[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getMilestoneIdentifier(milestone: Pick<IMilestone, 'id'>): number {
    return milestone.id;
  }

  compareMilestone(o1: Pick<IMilestone, 'id'> | null, o2: Pick<IMilestone, 'id'> | null): boolean {
    return o1 && o2 ? this.getMilestoneIdentifier(o1) === this.getMilestoneIdentifier(o2) : o1 === o2;
  }

  addMilestoneToCollectionIfMissing<Type extends Pick<IMilestone, 'id'>>(
    milestoneCollection: Type[],
    ...milestonesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const milestones: Type[] = milestonesToCheck.filter(isPresent);
    if (milestones.length > 0) {
      const milestoneCollectionIdentifiers = milestoneCollection.map(milestoneItem => this.getMilestoneIdentifier(milestoneItem));
      const milestonesToAdd = milestones.filter(milestoneItem => {
        const milestoneIdentifier = this.getMilestoneIdentifier(milestoneItem);
        if (milestoneCollectionIdentifiers.includes(milestoneIdentifier)) {
          return false;
        }
        milestoneCollectionIdentifiers.push(milestoneIdentifier);
        return true;
      });
      return [...milestonesToAdd, ...milestoneCollection];
    }
    return milestoneCollection;
  }

  protected convertDateFromClient<T extends IMilestone | NewMilestone | PartialUpdateMilestone>(milestone: T): RestOf<T> {
    return {
      ...milestone,
      startDate: milestone.startDate?.format(DATE_FORMAT) ?? null,
      dueDate: milestone.dueDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restMilestone: RestMilestone): IMilestone {
    return {
      ...restMilestone,
      startDate: restMilestone.startDate ? dayjs(restMilestone.startDate) : undefined,
      dueDate: restMilestone.dueDate ? dayjs(restMilestone.dueDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestMilestone>): HttpResponse<IMilestone> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestMilestone[]>): HttpResponse<IMilestone[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
