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

// NEW: shape of the response returned by POST /account/link-picture.
export interface LinkPictureResponse {
  imageUrl: string;
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

  // Uploads a profile picture. Returns the id of the unlinked Attachment created server-side
  // and its public URL (for showing a preview). Used both ahead of registration (see
  // RegisterComponent, where the id is sent along with the registration payload) and from an
  // already-registered user's profile page (see ProfileComponent, which follows this call
  // with linkPicture() below instead of waiting for a form submit).
  uploadPicture(file: File): Observable<UploadPictureResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadPictureResponse>(this.applicationConfigService.getEndpointFor('api/account/upload-picture'), formData);
  }

  // NEW: links an already-uploaded profile picture (via uploadPicture() above) to the
  // current, already-registered user - the authenticated counterpart to the
  // pictureAttachmentId sent as part of Registration for a brand-new account. Used by
  // ProfileComponent to update an existing user's picture.
  linkPicture(attachmentId: number): Observable<LinkPictureResponse> {
    return this.http.post<LinkPictureResponse>(this.applicationConfigService.getEndpointFor('api/account/link-picture'), {
      attachmentId,
    });
  }
}
