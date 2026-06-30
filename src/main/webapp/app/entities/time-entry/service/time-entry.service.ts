import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITimeEntry, NewTimeEntry } from '../time-entry.model';

export type PartialUpdateTimeEntry = Partial<ITimeEntry> & Pick<ITimeEntry, 'id'>;

type RestOf<T extends ITimeEntry | NewTimeEntry> = Omit<T, 'startTime' | 'endTime' | 'entryDate'> & {
  startTime?: string | null;
  endTime?: string | null;
  entryDate?: string | null;
};

export type RestTimeEntry = RestOf<ITimeEntry>;

export type NewRestTimeEntry = RestOf<NewTimeEntry>;

export type PartialUpdateRestTimeEntry = RestOf<PartialUpdateTimeEntry>;

export type EntityResponseType = HttpResponse<ITimeEntry>;
export type EntityArrayResponseType = HttpResponse<ITimeEntry[]>;

@Injectable({ providedIn: 'root' })
export class TimeEntryService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/time-entries');

  create(timeEntry: NewTimeEntry): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(timeEntry);
    return this.http
      .post<RestTimeEntry>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(timeEntry: ITimeEntry): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(timeEntry);
    return this.http
      .put<RestTimeEntry>(`${this.resourceUrl}/${this.getTimeEntryIdentifier(timeEntry)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(timeEntry: PartialUpdateTimeEntry): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(timeEntry);
    return this.http
      .patch<RestTimeEntry>(`${this.resourceUrl}/${this.getTimeEntryIdentifier(timeEntry)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestTimeEntry>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestTimeEntry[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTimeEntryIdentifier(timeEntry: Pick<ITimeEntry, 'id'>): number {
    return timeEntry.id;
  }

  compareTimeEntry(o1: Pick<ITimeEntry, 'id'> | null, o2: Pick<ITimeEntry, 'id'> | null): boolean {
    return o1 && o2 ? this.getTimeEntryIdentifier(o1) === this.getTimeEntryIdentifier(o2) : o1 === o2;
  }

  addTimeEntryToCollectionIfMissing<Type extends Pick<ITimeEntry, 'id'>>(
    timeEntryCollection: Type[],
    ...timeEntriesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const timeEntries: Type[] = timeEntriesToCheck.filter(isPresent);
    if (timeEntries.length > 0) {
      const timeEntryCollectionIdentifiers = timeEntryCollection.map(timeEntryItem => this.getTimeEntryIdentifier(timeEntryItem));
      const timeEntriesToAdd = timeEntries.filter(timeEntryItem => {
        const timeEntryIdentifier = this.getTimeEntryIdentifier(timeEntryItem);
        if (timeEntryCollectionIdentifiers.includes(timeEntryIdentifier)) {
          return false;
        }
        timeEntryCollectionIdentifiers.push(timeEntryIdentifier);
        return true;
      });
      return [...timeEntriesToAdd, ...timeEntryCollection];
    }
    return timeEntryCollection;
  }

  protected convertDateFromClient<T extends ITimeEntry | NewTimeEntry | PartialUpdateTimeEntry>(timeEntry: T): RestOf<T> {
    return {
      ...timeEntry,
      startTime: timeEntry.startTime?.toJSON() ?? null,
      endTime: timeEntry.endTime?.toJSON() ?? null,
      entryDate: timeEntry.entryDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restTimeEntry: RestTimeEntry): ITimeEntry {
    return {
      ...restTimeEntry,
      startTime: restTimeEntry.startTime ? dayjs(restTimeEntry.startTime) : undefined,
      endTime: restTimeEntry.endTime ? dayjs(restTimeEntry.endTime) : undefined,
      entryDate: restTimeEntry.entryDate ? dayjs(restTimeEntry.entryDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestTimeEntry>): HttpResponse<ITimeEntry> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestTimeEntry[]>): HttpResponse<ITimeEntry[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
