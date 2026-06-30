import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITaskComment } from '../task-comment.model';
import { TaskCommentService } from '../service/task-comment.service';

const taskCommentResolve = (route: ActivatedRouteSnapshot): Observable<null | ITaskComment> => {
  const id = route.params.id;
  if (id) {
    return inject(TaskCommentService)
      .find(id)
      .pipe(
        mergeMap((taskComment: HttpResponse<ITaskComment>) => {
          if (taskComment.body) {
            return of(taskComment.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default taskCommentResolve;
