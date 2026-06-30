import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IChecklistItem, NewChecklistItem } from '../checklist-item.model';

export type PartialUpdateChecklistItem = Partial<IChecklistItem> & Pick<IChecklistItem, 'id'>;

export type EntityResponseType = HttpResponse<IChecklistItem>;
export type EntityArrayResponseType = HttpResponse<IChecklistItem[]>;

@Injectable({ providedIn: 'root' })
export class ChecklistItemService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/checklist-items');

  create(checklistItem: NewChecklistItem): Observable<EntityResponseType> {
    return this.http.post<IChecklistItem>(this.resourceUrl, checklistItem, { observe: 'response' });
  }

  update(checklistItem: IChecklistItem): Observable<EntityResponseType> {
    return this.http.put<IChecklistItem>(`${this.resourceUrl}/${this.getChecklistItemIdentifier(checklistItem)}`, checklistItem, {
      observe: 'response',
    });
  }

  partialUpdate(checklistItem: PartialUpdateChecklistItem): Observable<EntityResponseType> {
    return this.http.patch<IChecklistItem>(`${this.resourceUrl}/${this.getChecklistItemIdentifier(checklistItem)}`, checklistItem, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IChecklistItem>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IChecklistItem[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getChecklistItemIdentifier(checklistItem: Pick<IChecklistItem, 'id'>): number {
    return checklistItem.id;
  }

  compareChecklistItem(o1: Pick<IChecklistItem, 'id'> | null, o2: Pick<IChecklistItem, 'id'> | null): boolean {
    return o1 && o2 ? this.getChecklistItemIdentifier(o1) === this.getChecklistItemIdentifier(o2) : o1 === o2;
  }

  addChecklistItemToCollectionIfMissing<Type extends Pick<IChecklistItem, 'id'>>(
    checklistItemCollection: Type[],
    ...checklistItemsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const checklistItems: Type[] = checklistItemsToCheck.filter(isPresent);
    if (checklistItems.length > 0) {
      const checklistItemCollectionIdentifiers = checklistItemCollection.map(checklistItemItem =>
        this.getChecklistItemIdentifier(checklistItemItem),
      );
      const checklistItemsToAdd = checklistItems.filter(checklistItemItem => {
        const checklistItemIdentifier = this.getChecklistItemIdentifier(checklistItemItem);
        if (checklistItemCollectionIdentifiers.includes(checklistItemIdentifier)) {
          return false;
        }
        checklistItemCollectionIdentifiers.push(checklistItemIdentifier);
        return true;
      });
      return [...checklistItemsToAdd, ...checklistItemCollection];
    }
    return checklistItemCollection;
  }
}
