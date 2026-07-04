import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomSwService {
  register(): void {
    if ('serviceWorker' in navigator && !environment.DEBUG_INFO_ENABLED) {
      navigator.serviceWorker.register('/sw.js');
    }
  }
}
