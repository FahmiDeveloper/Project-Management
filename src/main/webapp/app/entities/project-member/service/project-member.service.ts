import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IProjectMember, NewProjectMember } from '../project-member.model';

export type PartialUpdateProjectMember = Partial<IProjectMember> & Pick<IProjectMember, 'id'>;

type RestOf<T extends IProjectMember | NewProjectMember> = Omit<T, 'joinedDate'> & {
  joinedDate?: string | null;
};

export type RestProjectMember = RestOf<IProjectMember>;

export type NewRestProjectMember = RestOf<NewProjectMember>;

export type PartialUpdateRestProjectMember = RestOf<PartialUpdateProjectMember>;

export type EntityResponseType = HttpResponse<IProjectMember>;
export type EntityArrayResponseType = HttpResponse<IProjectMember[]>;

@Injectable({ providedIn: 'root' })
export class ProjectMemberService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/project-members');

  create(projectMember: NewProjectMember): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(projectMember);
    return this.http
      .post<RestProjectMember>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(projectMember: IProjectMember): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(projectMember);
    return this.http
      .put<RestProjectMember>(`${this.resourceUrl}/${this.getProjectMemberIdentifier(projectMember)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(projectMember: PartialUpdateProjectMember): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(projectMember);
    return this.http
      .patch<RestProjectMember>(`${this.resourceUrl}/${this.getProjectMemberIdentifier(projectMember)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestProjectMember>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestProjectMember[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getProjectMemberIdentifier(projectMember: Pick<IProjectMember, 'id'>): number {
    return projectMember.id;
  }

  compareProjectMember(o1: Pick<IProjectMember, 'id'> | null, o2: Pick<IProjectMember, 'id'> | null): boolean {
    return o1 && o2 ? this.getProjectMemberIdentifier(o1) === this.getProjectMemberIdentifier(o2) : o1 === o2;
  }

  addProjectMemberToCollectionIfMissing<Type extends Pick<IProjectMember, 'id'>>(
    projectMemberCollection: Type[],
    ...projectMembersToCheck: (Type | null | undefined)[]
  ): Type[] {
    const projectMembers: Type[] = projectMembersToCheck.filter(isPresent);
    if (projectMembers.length > 0) {
      const projectMemberCollectionIdentifiers = projectMemberCollection.map(projectMemberItem =>
        this.getProjectMemberIdentifier(projectMemberItem),
      );
      const projectMembersToAdd = projectMembers.filter(projectMemberItem => {
        const projectMemberIdentifier = this.getProjectMemberIdentifier(projectMemberItem);
        if (projectMemberCollectionIdentifiers.includes(projectMemberIdentifier)) {
          return false;
        }
        projectMemberCollectionIdentifiers.push(projectMemberIdentifier);
        return true;
      });
      return [...projectMembersToAdd, ...projectMemberCollection];
    }
    return projectMemberCollection;
  }

  protected convertDateFromClient<T extends IProjectMember | NewProjectMember | PartialUpdateProjectMember>(projectMember: T): RestOf<T> {
    return {
      ...projectMember,
      joinedDate: projectMember.joinedDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restProjectMember: RestProjectMember): IProjectMember {
    return {
      ...restProjectMember,
      joinedDate: restProjectMember.joinedDate ? dayjs(restProjectMember.joinedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestProjectMember>): HttpResponse<IProjectMember> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestProjectMember[]>): HttpResponse<IProjectMember[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
