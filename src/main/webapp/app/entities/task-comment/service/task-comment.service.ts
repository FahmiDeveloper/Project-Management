import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITaskComment, NewTaskComment } from '../task-comment.model';

export type PartialUpdateTaskComment = Partial<ITaskComment> & Pick<ITaskComment, 'id'>;

type RestOf<T extends ITaskComment | NewTaskComment> = Omit<T, 'createdDate'> & {
  createdDate?: string | null;
};

export type RestTaskComment = RestOf<ITaskComment>;

export type NewRestTaskComment = RestOf<NewTaskComment>;

export type PartialUpdateRestTaskComment = RestOf<PartialUpdateTaskComment>;

export type EntityResponseType = HttpResponse<ITaskComment>;
export type EntityArrayResponseType = HttpResponse<ITaskComment[]>;

@Injectable({ providedIn: 'root' })
export class TaskCommentService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/task-comments');

  create(taskComment: NewTaskComment): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(taskComment);
    return this.http
      .post<RestTaskComment>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(taskComment: ITaskComment): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(taskComment);
    return this.http
      .put<RestTaskComment>(`${this.resourceUrl}/${this.getTaskCommentIdentifier(taskComment)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(taskComment: PartialUpdateTaskComment): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(taskComment);
    return this.http
      .patch<RestTaskComment>(`${this.resourceUrl}/${this.getTaskCommentIdentifier(taskComment)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestTaskComment>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestTaskComment[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTaskCommentIdentifier(taskComment: Pick<ITaskComment, 'id'>): number {
    return taskComment.id;
  }

  compareTaskComment(o1: Pick<ITaskComment, 'id'> | null, o2: Pick<ITaskComment, 'id'> | null): boolean {
    return o1 && o2 ? this.getTaskCommentIdentifier(o1) === this.getTaskCommentIdentifier(o2) : o1 === o2;
  }

  addTaskCommentToCollectionIfMissing<Type extends Pick<ITaskComment, 'id'>>(
    taskCommentCollection: Type[],
    ...taskCommentsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const taskComments: Type[] = taskCommentsToCheck.filter(isPresent);
    if (taskComments.length > 0) {
      const taskCommentCollectionIdentifiers = taskCommentCollection.map(taskCommentItem => this.getTaskCommentIdentifier(taskCommentItem));
      const taskCommentsToAdd = taskComments.filter(taskCommentItem => {
        const taskCommentIdentifier = this.getTaskCommentIdentifier(taskCommentItem);
        if (taskCommentCollectionIdentifiers.includes(taskCommentIdentifier)) {
          return false;
        }
        taskCommentCollectionIdentifiers.push(taskCommentIdentifier);
        return true;
      });
      return [...taskCommentsToAdd, ...taskCommentCollection];
    }
    return taskCommentCollection;
  }

  protected convertDateFromClient<T extends ITaskComment | NewTaskComment | PartialUpdateTaskComment>(taskComment: T): RestOf<T> {
    return {
      ...taskComment,
      createdDate: taskComment.createdDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restTaskComment: RestTaskComment): ITaskComment {
    return {
      ...restTaskComment,
      createdDate: restTaskComment.createdDate ? dayjs(restTaskComment.createdDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestTaskComment>): HttpResponse<ITaskComment> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestTaskComment[]>): HttpResponse<ITaskComment[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
