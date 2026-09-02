import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SupportRequest {
  category: string;
  subject: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class HelpSupportService {
  // TODO: point this at your real backend endpoint, e.g.
  // `${SERVER_API_URL}api/support-requests` if you follow the usual JHipster pattern.
  private readonly resourceUrl = 'api/support-requests';

  constructor(private http: HttpClient) {}

  sendSupportRequest(request: SupportRequest): Observable<void> {
    return this.http.post<void>(this.resourceUrl, request);
  }
}
