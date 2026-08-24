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

// NEW: shape of the response returned by POST /account/upload-picture.
export interface UploadPictureResponse {
  attachmentId: number;
  fileUrl: string;
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

  // NEW: uploads a profile picture ahead of registration. Returns the id of the unlinked
  // Attachment created server-side (to be sent back as Registration.pictureAttachmentId) and
  // its public URL (for showing a preview).
  uploadPicture(file: File): Observable<UploadPictureResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadPictureResponse>(this.applicationConfigService.getEndpointFor('api/account/upload-picture'), formData);
  }
}
