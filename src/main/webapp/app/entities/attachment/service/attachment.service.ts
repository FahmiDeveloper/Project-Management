import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IAttachment, NewAttachment } from '../attachment.model';

export type PartialUpdateAttachment = Partial<IAttachment> & Pick<IAttachment, 'id'>;

type RestOf<T extends IAttachment | NewAttachment> = Omit<T, 'uploadedDate'> & {
  uploadedDate?: string | null;
};

export type RestAttachment = RestOf<IAttachment>;

export type NewRestAttachment = RestOf<NewAttachment>;

export type PartialUpdateRestAttachment = RestOf<PartialUpdateAttachment>;

export type EntityResponseType = HttpResponse<IAttachment>;
export type EntityArrayResponseType = HttpResponse<IAttachment[]>;

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/attachments');

  create(attachment: NewAttachment): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(attachment);
    return this.http
      .post<RestAttachment>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(attachment: IAttachment): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(attachment);
    return this.http
      .put<RestAttachment>(`${this.resourceUrl}/${this.getAttachmentIdentifier(attachment)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(attachment: PartialUpdateAttachment): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(attachment);
    return this.http
      .patch<RestAttachment>(`${this.resourceUrl}/${this.getAttachmentIdentifier(attachment)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestAttachment>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestAttachment[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getAttachmentIdentifier(attachment: Pick<IAttachment, 'id'>): number {
    return attachment.id;
  }

  compareAttachment(o1: Pick<IAttachment, 'id'> | null, o2: Pick<IAttachment, 'id'> | null): boolean {
    return o1 && o2 ? this.getAttachmentIdentifier(o1) === this.getAttachmentIdentifier(o2) : o1 === o2;
  }

  addAttachmentToCollectionIfMissing<Type extends Pick<IAttachment, 'id'>>(
    attachmentCollection: Type[],
    ...attachmentsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const attachments: Type[] = attachmentsToCheck.filter(isPresent);
    if (attachments.length > 0) {
      const attachmentCollectionIdentifiers = attachmentCollection.map(attachmentItem => this.getAttachmentIdentifier(attachmentItem));
      const attachmentsToAdd = attachments.filter(attachmentItem => {
        const attachmentIdentifier = this.getAttachmentIdentifier(attachmentItem);
        if (attachmentCollectionIdentifiers.includes(attachmentIdentifier)) {
          return false;
        }
        attachmentCollectionIdentifiers.push(attachmentIdentifier);
        return true;
      });
      return [...attachmentsToAdd, ...attachmentCollection];
    }
    return attachmentCollection;
  }

  protected convertDateFromClient<T extends IAttachment | NewAttachment | PartialUpdateAttachment>(attachment: T): RestOf<T> {
    return {
      ...attachment,
      uploadedDate: attachment.uploadedDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restAttachment: RestAttachment): IAttachment {
    return {
      ...restAttachment,
      uploadedDate: restAttachment.uploadedDate ? dayjs(restAttachment.uploadedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestAttachment>): HttpResponse<IAttachment> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestAttachment[]>): HttpResponse<IAttachment[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
