import { Injectable, effect, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'jhi-theme-preference';

// NOTE ON SCOPE: this only persists to this browser (localStorage), not to the account
// on the backend - nothing in AccountResource/UserService exposes a themePreference
// field, so there's nowhere server-side to save it yet. If you want the choice to
// follow the user across devices, that needs a new column + endpoint on the backend
// first; happy to help with that once you show me the User entity.
//
// ALSO IMPORTANT: this service only toggles `theme-dark` / `theme-light` classes on
// <html>. Your existing dark-mode styling (see register.component.scss) is written as
// `@media (prefers-color-scheme: dark) { ... }`, which only reacts to the OS setting,
// not to these classes. For "Dark" and "Light" to actually override the OS choice,
// those media queries need to become class selectors (e.g. `:host-context(.theme-dark)`
// or `.theme-dark &`) throughout the app's SCSS. This service provides the mechanism;
// wiring existing components to it is a separate, larger pass I can help with.
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly preference = signal<ThemePreference>(this.readStored());

  private readonly systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.systemDarkQuery.addEventListener('change', () => {
      if (this.preference() === 'system') {
        this.applyTheme();
      }
    });

    effect(() => {
      const value = this.preference();
      localStorage.setItem(STORAGE_KEY, value);
      this.applyTheme();
    });
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
  }

  private readStored(): ThemePreference {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  }

  private applyTheme(): void {
    const isDark = this.preference() === 'dark' || (this.preference() === 'system' && this.systemDarkQuery.matches);
    document.documentElement.classList.toggle('theme-dark', isDark);
    document.documentElement.classList.toggle('theme-light', !isDark);
  }
}
