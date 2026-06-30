import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IChecklist } from '../checklist.model';
import { ChecklistService } from '../service/checklist.service';

const checklistResolve = (route: ActivatedRouteSnapshot): Observable<null | IChecklist> => {
  const id = route.params.id;
  if (id) {
    return inject(ChecklistService)
      .find(id)
      .pipe(
        mergeMap((checklist: HttpResponse<IChecklist>) => {
          if (checklist.body) {
            return of(checklist.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default checklistResolve;
