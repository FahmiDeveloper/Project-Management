import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

// Read-only display fields (employeeNumber, jobTitle) plus the one editable field (phone)
// shown on the profile page. Phone lives on Employee, not User/Account, so it's fetched and
// saved separately from AccountService.
export interface EmployeeProfile {
  employeeNumber: string;
  jobTitle: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  getEmployeeProfile(): Observable<EmployeeProfile> {
    return this.http.get<EmployeeProfile>(this.applicationConfigService.getEndpointFor('api/account/employee'));
  }

  updatePhone(phone: string): Observable<{ phone: string }> {
    return this.http.post<{ phone: string }>(this.applicationConfigService.getEndpointFor('api/account/employee/phone'), { phone });
  }
}
