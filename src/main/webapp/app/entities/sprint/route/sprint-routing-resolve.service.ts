import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISprint } from '../sprint.model';
import { SprintService } from '../service/sprint.service';

const sprintResolve = (route: ActivatedRouteSnapshot): Observable<null | ISprint> => {
  const id = route.params.id;
  if (id) {
    return inject(SprintService)
      .find(id)
      .pipe(
        mergeMap((sprint: HttpResponse<ISprint>) => {
          if (sprint.body) {
            return of(sprint.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default sprintResolve;
