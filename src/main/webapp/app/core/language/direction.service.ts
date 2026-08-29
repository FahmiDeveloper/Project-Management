import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// Kept in sync with the `rtl` flags in find-language-from-key.pipe.ts - 'ar' is the only
// RTL language currently in language.constants.ts, but any future RTL language (e.g. 'he',
// 'fa') should be added to both places together.
const RTL_LANGUAGES = new Set(['ar']);

@Injectable({ providedIn: 'root' })
export class DirectionService {
  private readonly translateService = inject(TranslateService);

  readonly currentLang = signal(this.translateService.currentLang || this.translateService.getDefaultLang() || 'en');
  readonly isRtl = computed(() => RTL_LANGUAGES.has(this.currentLang()));
  readonly dir = computed<'ltr' | 'rtl'>(() => (this.isRtl() ? 'rtl' : 'ltr'));

  constructor() {
    // Apply immediately in case the language was already set before this service was
    // constructed (e.g. on app boot), then keep listening for later changes - both from
    // SettingsComponent's save() and from anywhere else that calls translateService.use().
    this.applyDocumentDir();
    this.translateService.onLangChange.subscribe(event => {
      this.currentLang.set(event.lang);
      this.applyDocumentDir();
    });
  }

  private applyDocumentDir(): void {
    const dir = this.dir();
    // Pure CSS layout (flexbox row reversal, native table column order, text-align) follows
    // this automatically via inheritance - no per-component/per-table code needed for that
    // part. This only covers the CSS side; CDK-positioned components (mat-sidenav, overlays)
    // additionally need a reactive [dir] directive ancestor - see BodyComponent.
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', this.currentLang());
  }
}
