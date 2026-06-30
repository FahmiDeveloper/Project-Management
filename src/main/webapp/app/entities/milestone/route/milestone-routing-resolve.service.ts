import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IMilestone } from '../milestone.model';
import { MilestoneService } from '../service/milestone.service';

const milestoneResolve = (route: ActivatedRouteSnapshot): Observable<null | IMilestone> => {
  const id = route.params.id;
  if (id) {
    return inject(MilestoneService)
      .find(id)
      .pipe(
        mergeMap((milestone: HttpResponse<IMilestone>) => {
          if (milestone.body) {
            return of(milestone.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default milestoneResolve;
