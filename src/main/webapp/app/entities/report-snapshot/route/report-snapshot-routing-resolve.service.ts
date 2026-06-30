import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IReportSnapshot } from '../report-snapshot.model';
import { ReportSnapshotService } from '../service/report-snapshot.service';

const reportSnapshotResolve = (route: ActivatedRouteSnapshot): Observable<null | IReportSnapshot> => {
  const id = route.params.id;
  if (id) {
    return inject(ReportSnapshotService)
      .find(id)
      .pipe(
        mergeMap((reportSnapshot: HttpResponse<IReportSnapshot>) => {
          if (reportSnapshot.body) {
            return of(reportSnapshot.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default reportSnapshotResolve;
