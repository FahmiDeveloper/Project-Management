import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IChecklistItem } from '../checklist-item.model';
import { ChecklistItemService } from '../service/checklist-item.service';

const checklistItemResolve = (route: ActivatedRouteSnapshot): Observable<null | IChecklistItem> => {
  const id = route.params.id;
  if (id) {
    return inject(ChecklistItemService)
      .find(id)
      .pipe(
        mergeMap((checklistItem: HttpResponse<IChecklistItem>) => {
          if (checklistItem.body) {
            return of(checklistItem.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default checklistItemResolve;
