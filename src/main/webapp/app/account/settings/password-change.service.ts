import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

// Mirrors AccountResource#changePassword (POST /api/account/change-password), which
// expects a PasswordChangeDTO { currentPassword, newPassword } and returns 200 with an
// empty body on success, or a 400 InvalidPasswordException if the new password fails
// the length check server-side.
@Injectable({ providedIn: 'root' })
export class PasswordChangeService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  changePassword(currentPassword: string, newPassword: string): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('api/account/change-password'), {
      currentPassword,
      newPassword,
    });
  }
}
