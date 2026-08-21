import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { Registration } from './register.model';

export interface VerifyCodePayload {
  login: string;
  code: string;
}

export interface ResendCodePayload {
  login: string;
}

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  save(registration: Registration): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('api/register'), registration);
  }

  verifyCode(payload: VerifyCodePayload): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('api/account/verify-code'), payload);
  }

  resendCode(payload: ResendCodePayload): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('api/account/resend-verification-code'), payload);
  }
}
