import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Login } from 'app/login/login.model';
import { ApplicationConfigService } from '../config/application-config.service';
import { StateStorageService } from './state-storage.service';

type JwtToken = {
  id_token: string;
};

@Injectable({ providedIn: 'root' })
export class AuthServerProvider {
  private readonly http = inject(HttpClient);
  private readonly stateStorageService = inject(StateStorageService);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  getToken(): string {
    // 1. First attempt to fetch via JHipster's default state storage
    let token = this.stateStorageService.getAuthenticationToken();

    // 2. Capacitor Fallback: If not found in memory/service state, check window native storages
    if (!token) {
      token = window.localStorage.getItem('authenticationToken') || window.sessionStorage.getItem('authenticationToken') || '';
    }
    return token;
  }

  login(credentials: Login): Observable<void> {
    return this.http
      .post<JwtToken>(this.applicationConfigService.getEndpointFor('api/authenticate'), credentials)
      .pipe(map(response => this.authenticateSuccess(response, credentials.rememberMe)));
  }

  logout(): Observable<void> {
    return new Observable(observer => {
      // Clear JHipster state
      this.stateStorageService.clearAuthenticationToken();

      // Clear native window fallbacks for Capacitor
      window.localStorage.removeItem('authenticationToken');
      window.sessionStorage.removeItem('authenticationToken');

      observer.complete();
    });
  }

  private authenticateSuccess(response: JwtToken, rememberMe: boolean): void {
    // Save to JHipster state engine so route guards and interceptors function seamlessly
    this.stateStorageService.storeAuthenticationToken(response.id_token, rememberMe);

    // Save to native window storage fallbacks for your Capacitor environment
    if (rememberMe) {
      window.localStorage.setItem('authenticationToken', response.id_token);
    } else {
      window.sessionStorage.setItem('authenticationToken', response.id_token);
    }
  }
}
