import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IDashboard } from '../dashboard.model';
import { DashboardService } from '../service/dashboard.service';

const dashboardResolve = (route: ActivatedRouteSnapshot): Observable<null | IDashboard> => {
  const id = route.params.id;
  if (id) {
    return inject(DashboardService)
      .find(id)
      .pipe(
        mergeMap((dashboard: HttpResponse<IDashboard>) => {
          if (dashboard.body) {
            return of(dashboard.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default dashboardResolve;
