import { Component, NgZone, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subject, Subscription, combineLatest, debounceTime, distinctUntilChanged, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormsModule } from '@angular/forms';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { IChecklistItem } from '../checklist-item.model';
import { ChecklistItemService, EntityArrayResponseType } from '../service/checklist-item.service';
import { ChecklistItemDeleteDialogComponent } from '../delete/checklist-item-delete-dialog.component';

import { IChecklist } from 'app/entities/checklist/checklist.model';
import { ChecklistService } from 'app/entities/checklist/service/checklist.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'jhi-checklist-item',
  templateUrl: './checklist-item.component.html',
  styleUrls: ['./checklist-item.component.scss'],
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
})
export class ChecklistItemComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  checklistItems = signal<IChecklistItem[]>([]);
  isLoading = false;

  displayedColumns: string[] = ['content', 'isDone', 'position', 'checklist', 'actions'];

  // ---- Content filter (debounced text input) ----
  filterContent = signal<string>('');
  private readonly contentInput$ = new Subject<string>();
  private contentSubscription: Subscription | null = null;

  // ---- Checklist filter (searchable autocomplete) ----
  filterChecklistId = signal<number | null>(null);
  checklistSearchTerm = signal<string>('');
  checklists = signal<IChecklist[]>([]);
  filteredChecklists = computed(() => {
    const term = this.checklistSearchTerm().toLowerCase().trim();
    if (!term) {
      return this.checklists();
    }
    return this.checklists().filter(c => (c.title ?? '').toLowerCase().includes(term));
  });

  sortState = sortStateSignal({});

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  public readonly router = inject(Router);
  protected readonly checklistItemService = inject(ChecklistItemService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly checklistService = inject(ChecklistService);

  trackId = (item: IChecklistItem): number => this.checklistItemService.getChecklistItemIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();

    this.contentSubscription = this.contentInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      this.filterContent.set(value);
      this.page = 1;
      this.load();
    });

    this.checklistService.query().subscribe(res => this.checklists.set(res.body ?? []));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.contentSubscription?.unsubscribe();
  }

  onContentInput(value: string): void {
    this.contentInput$.next(value);
  }

  // ---- Checklist autocomplete handlers ----
  displayChecklistTitle = (checklist: IChecklist | null): string => (checklist ? (checklist.title ?? '') : '');

  onChecklistInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.checklistSearchTerm.set(value);
  }

  onChecklistSelected(event: MatAutocompleteSelectedEvent): void {
    const checklist: IChecklist | null = event.option.value;
    this.filterChecklistId.set(checklist ? checklist.id : null);
    this.checklistSearchTerm.set(this.displayChecklistTitle(checklist));
    this.page = 1;
    this.load();
  }

  clearSearch(): void {
    this.filterContent.set('');
    this.filterChecklistId.set(null);
    this.checklistSearchTerm.set('');
    this.page = 1;
    this.load();
  }

  delete(checklistItem: IChecklistItem): void {
    const modalRef = this.modalService.open(ChecklistItemDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.checklistItem = checklistItem;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(this.page, event);
  }

  navigateToPage(page: number): void {
    this.handleNavigation(page, this.sortState());
  }

  onPageChange(event: PageEvent): void {
    this.navigateToPage(event.pageIndex + 1);
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const page = params.get(PAGE_HEADER);
    this.page = +(page ?? 1);
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.checklistItems.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: IChecklistItem[] | null): IChecklistItem[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    const { page } = this;

    this.isLoading = true;
    const pageToLoad: number = page;
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      eagerload: true,
      sort: this.sortService.buildSortParam(this.sortState()),
    };

    const content = this.filterContent().trim();
    if (content) {
      queryObject['content'] = content;
    }

    const checklistId = this.filterChecklistId();
    if (checklistId) {
      queryObject['checklistId'] = checklistId;
    }

    return this.checklistItemService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(page: number, sortState: SortState): void {
    const queryParamsObj = {
      page,
      size: this.itemsPerPage,
      sort: this.sortService.buildSortParam(sortState),
    };

    this.ngZone.run(() => {
      this.router.navigate(['./'], {
        relativeTo: this.activatedRoute,
        queryParams: queryParamsObj,
      });
    });
  }
}
