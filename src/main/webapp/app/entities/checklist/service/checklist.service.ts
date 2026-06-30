import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IChecklist, NewChecklist } from '../checklist.model';

export type PartialUpdateChecklist = Partial<IChecklist> & Pick<IChecklist, 'id'>;

type RestOf<T extends IChecklist | NewChecklist> = Omit<T, 'createdDate'> & {
  createdDate?: string | null;
};

export type RestChecklist = RestOf<IChecklist>;

export type NewRestChecklist = RestOf<NewChecklist>;

export type PartialUpdateRestChecklist = RestOf<PartialUpdateChecklist>;

export type EntityResponseType = HttpResponse<IChecklist>;
export type EntityArrayResponseType = HttpResponse<IChecklist[]>;

@Injectable({ providedIn: 'root' })
export class ChecklistService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/checklists');

  create(checklist: NewChecklist): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(checklist);
    return this.http
      .post<RestChecklist>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(checklist: IChecklist): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(checklist);
    return this.http
      .put<RestChecklist>(`${this.resourceUrl}/${this.getChecklistIdentifier(checklist)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(checklist: PartialUpdateChecklist): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(checklist);
    return this.http
      .patch<RestChecklist>(`${this.resourceUrl}/${this.getChecklistIdentifier(checklist)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestChecklist>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestChecklist[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getChecklistIdentifier(checklist: Pick<IChecklist, 'id'>): number {
    return checklist.id;
  }

  compareChecklist(o1: Pick<IChecklist, 'id'> | null, o2: Pick<IChecklist, 'id'> | null): boolean {
    return o1 && o2 ? this.getChecklistIdentifier(o1) === this.getChecklistIdentifier(o2) : o1 === o2;
  }

  addChecklistToCollectionIfMissing<Type extends Pick<IChecklist, 'id'>>(
    checklistCollection: Type[],
    ...checklistsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const checklists: Type[] = checklistsToCheck.filter(isPresent);
    if (checklists.length > 0) {
      const checklistCollectionIdentifiers = checklistCollection.map(checklistItem => this.getChecklistIdentifier(checklistItem));
      const checklistsToAdd = checklists.filter(checklistItem => {
        const checklistIdentifier = this.getChecklistIdentifier(checklistItem);
        if (checklistCollectionIdentifiers.includes(checklistIdentifier)) {
          return false;
        }
        checklistCollectionIdentifiers.push(checklistIdentifier);
        return true;
      });
      return [...checklistsToAdd, ...checklistCollection];
    }
    return checklistCollection;
  }

  protected convertDateFromClient<T extends IChecklist | NewChecklist | PartialUpdateChecklist>(checklist: T): RestOf<T> {
    return {
      ...checklist,
      createdDate: checklist.createdDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restChecklist: RestChecklist): IChecklist {
    return {
      ...restChecklist,
      createdDate: restChecklist.createdDate ? dayjs(restChecklist.createdDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestChecklist>): HttpResponse<IChecklist> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestChecklist[]>): HttpResponse<IChecklist[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
