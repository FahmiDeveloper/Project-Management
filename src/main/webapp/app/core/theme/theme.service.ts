import { Injectable, effect, signal } from '@angular/core';

export type ThemePreference = 'dark' | 'system';

const STORAGE_KEY = 'jhi-theme-preference';

// NOTE ON SCOPE: this only persists to this browser (localStorage), not to the account
// on the backend - nothing in AccountResource/UserService exposes a themePreference
// field, so there's nowhere server-side to save it yet. If you want the choice to
// follow the user across devices, that needs a new column + endpoint on the backend
// first; happy to help with that once you show me the User entity.
//
// ALSO IMPORTANT: this service only toggles the `theme-dark` class on <html>. Some
// components (register.component.scss, verify-code.component.scss, login.component.scss)
// still use `@media (prefers-color-scheme: dark) { ... }`, which only reacts to the OS
// setting, not to this class - those need to be converted to `.theme-dark` selectors
// separately for "Dark" to override the OS choice on those pages too.
//
// "Light" has been removed as an explicit option - there are now only two choices:
// "Dark" (forces theme-dark on) and "System" (follows the OS; when the OS is light,
// this is the default/unmodified view since no class is applied at all).
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
    // Anyone with an old 'light' value saved from before this option existed falls back
    // to 'system' - which renders identically to the old 'light' state whenever the OS
    // itself is light, so this is a silent, harmless migration rather than a reset.
    return stored === 'dark' || stored === 'system' ? stored : 'system';
  }

  private applyTheme(): void {
    const isDark = this.preference() === 'dark' || (this.preference() === 'system' && this.systemDarkQuery.matches);
    document.documentElement.classList.toggle('theme-dark', isDark);
  }
}
