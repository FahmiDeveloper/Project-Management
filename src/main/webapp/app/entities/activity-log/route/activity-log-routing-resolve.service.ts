import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IActivityLog } from '../activity-log.model';
import { ActivityLogService } from '../service/activity-log.service';

const activityLogResolve = (route: ActivatedRouteSnapshot): Observable<null | IActivityLog> => {
  const id = route.params.id;
  if (id) {
    return inject(ActivityLogService)
      .find(id)
      .pipe(
        mergeMap((activityLog: HttpResponse<IActivityLog>) => {
          if (activityLog.body) {
            return of(activityLog.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default activityLogResolve;
