import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StateStorageService } from 'app/core/auth/state-storage.service';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const stateStorageService = inject(StateStorageService);
  const applicationConfigService = inject(ApplicationConfigService);

  // Get the token from JHipster's state storage
  let token = stateStorageService.getAuthenticationToken();

  // Capacitor Fallback: Fall back to native storage just in case state sync lagged
  if (!token) {
    token = window.localStorage.getItem('authenticationToken') || window.sessionStorage.getItem('authenticationToken');
  }

  const serverApiUrl = applicationConfigService.getEndpointFor('');

  // FORCE header inclusion if hitting the ngrok endpoint OR any route containing '/api/'
  if (token && (req.url.startsWith(serverApiUrl) || req.url.includes('/api/') || req.url.startsWith('http'))) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
