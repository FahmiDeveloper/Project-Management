import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITimeEntry } from '../time-entry.model';
import { TimeEntryService } from '../service/time-entry.service';

const timeEntryResolve = (route: ActivatedRouteSnapshot): Observable<null | ITimeEntry> => {
  const id = route.params.id;
  if (id) {
    return inject(TimeEntryService)
      .find(id)
      .pipe(
        mergeMap((timeEntry: HttpResponse<ITimeEntry>) => {
          if (timeEntry.body) {
            return of(timeEntry.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default timeEntryResolve;
