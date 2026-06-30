import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISprint, NewSprint } from '../sprint.model';

export type PartialUpdateSprint = Partial<ISprint> & Pick<ISprint, 'id'>;

type RestOf<T extends ISprint | NewSprint> = Omit<T, 'startDate' | 'endDate'> & {
  startDate?: string | null;
  endDate?: string | null;
};

export type RestSprint = RestOf<ISprint>;

export type NewRestSprint = RestOf<NewSprint>;

export type PartialUpdateRestSprint = RestOf<PartialUpdateSprint>;

export type EntityResponseType = HttpResponse<ISprint>;
export type EntityArrayResponseType = HttpResponse<ISprint[]>;

@Injectable({ providedIn: 'root' })
export class SprintService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/sprints');

  create(sprint: NewSprint): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(sprint);
    return this.http
      .post<RestSprint>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(sprint: ISprint): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(sprint);
    return this.http
      .put<RestSprint>(`${this.resourceUrl}/${this.getSprintIdentifier(sprint)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(sprint: PartialUpdateSprint): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(sprint);
    return this.http
      .patch<RestSprint>(`${this.resourceUrl}/${this.getSprintIdentifier(sprint)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestSprint>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestSprint[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSprintIdentifier(sprint: Pick<ISprint, 'id'>): number {
    return sprint.id;
  }

  compareSprint(o1: Pick<ISprint, 'id'> | null, o2: Pick<ISprint, 'id'> | null): boolean {
    return o1 && o2 ? this.getSprintIdentifier(o1) === this.getSprintIdentifier(o2) : o1 === o2;
  }

  addSprintToCollectionIfMissing<Type extends Pick<ISprint, 'id'>>(
    sprintCollection: Type[],
    ...sprintsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const sprints: Type[] = sprintsToCheck.filter(isPresent);
    if (sprints.length > 0) {
      const sprintCollectionIdentifiers = sprintCollection.map(sprintItem => this.getSprintIdentifier(sprintItem));
      const sprintsToAdd = sprints.filter(sprintItem => {
        const sprintIdentifier = this.getSprintIdentifier(sprintItem);
        if (sprintCollectionIdentifiers.includes(sprintIdentifier)) {
          return false;
        }
        sprintCollectionIdentifiers.push(sprintIdentifier);
        return true;
      });
      return [...sprintsToAdd, ...sprintCollection];
    }
    return sprintCollection;
  }

  protected convertDateFromClient<T extends ISprint | NewSprint | PartialUpdateSprint>(sprint: T): RestOf<T> {
    return {
      ...sprint,
      startDate: sprint.startDate?.format(DATE_FORMAT) ?? null,
      endDate: sprint.endDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restSprint: RestSprint): ISprint {
    return {
      ...restSprint,
      startDate: restSprint.startDate ? dayjs(restSprint.startDate) : undefined,
      endDate: restSprint.endDate ? dayjs(restSprint.endDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestSprint>): HttpResponse<ISprint> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestSprint[]>): HttpResponse<ISprint[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
