import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { RegisterService } from '../register/register.service';
import { ProfileService } from './profile.service';

// Kept in sync with AccountResource's MAX_PICTURE_SIZE_BYTES / ALLOWED_PICTURE_CONTENT_TYPES,
// same as RegisterComponent - instant client-side feedback rather than a round trip.
const MAX_PICTURE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PICTURE_CONTENT_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// Same default avatar shown in the toolbar/sidenav (see BodyComponent) when a user has no
// picture of their own, so the profile page's preview never shows an empty state.
const DEFAULT_PICTURE_URL = './../../../content/images/user-picture.png';

@Component({
  selector: 'jhi-profile',
  standalone: true,
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export default class ProfileComponent implements OnInit {
  success = signal(false);
  error = signal(false);

  // Read-only display fields for the linked Employee record. Null if the current user has no
  // Employee (e.g. a pre-existing admin account never created through self-registration) -
  // in that case the phone field and picture-linking are simply not offered.
  employeeNumber = signal<string | null>(null);
  jobTitle = signal<string | null>(null);
  hasEmployeeRecord = signal(false);

  // Picture upload state - same client-side validation pattern as RegisterComponent, but the
  // picture is linked to the account immediately on successful upload (via linkPicture) rather
  // than waiting for "Save changes", since the Employee already exists here.
  picturePreviewUrl = signal<string | null>(null);
  pictureUploading = signal(false);
  pictureError = signal<string | null>(null);
  currentImageUrl = signal<string | null>(null);

  profileForm = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      // Same rule as registration: optional, but if present must be exactly 8 digits.
      validators: [Validators.pattern(/^[0-9]{8}$/)],
    }),
  });

  private currentAccount: Account | null = null;

  private readonly accountService = inject(AccountService);
  private readonly registerService = inject(RegisterService);
  private readonly profileService = inject(ProfileService);

  ngOnInit(): void {
    this.accountService.identity(true).subscribe(account => {
      if (account) {
        this.currentAccount = account;
        this.currentImageUrl.set(account.imageUrl);
        this.profileForm.patchValue({
          firstName: account.firstName ?? '',
          lastName: account.lastName ?? '',
          email: account.email,
        });
      }
    });

    this.profileService.getEmployeeProfile().subscribe({
      next: employee => {
        this.hasEmployeeRecord.set(true);
        this.employeeNumber.set(employee.employeeNumber);
        this.jobTitle.set(employee.jobTitle);
        this.profileForm.patchValue({ phone: employee.phone });
      },
      error: () => {},
    });
  }

  get displayedImageUrl(): string {
    return this.picturePreviewUrl() ?? this.currentImageUrl() ?? DEFAULT_PICTURE_URL;
  }

  get hasCustomPicture(): boolean {
    return !!(this.picturePreviewUrl() ?? this.currentImageUrl());
  }

  onPictureSelected(event: Event): void {
    this.pictureError.set(null);
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_PICTURE_CONTENT_TYPES.includes(file.type)) {
      this.pictureError.set('Only PNG, JPEG, or WEBP images are allowed.');
      input.value = '';
      return;
    }
    if (file.size > MAX_PICTURE_SIZE_BYTES) {
      this.pictureError.set('Image must be smaller than 5MB.');
      input.value = '';
      return;
    }

    const previousPreview = this.picturePreviewUrl();
    if (previousPreview) {
      URL.revokeObjectURL(previousPreview);
    }
    this.picturePreviewUrl.set(URL.createObjectURL(file));
    this.pictureUploading.set(true);

    this.registerService.uploadPicture(file).subscribe({
      next: uploadResponse => {
        this.registerService.linkPicture(uploadResponse.attachmentId).subscribe({
          next: linkResponse => {
            this.currentImageUrl.set(linkResponse.imageUrl);
            if (this.currentAccount) {
              this.currentAccount = { ...this.currentAccount, imageUrl: linkResponse.imageUrl };
              // Refresh the account signal app-wide so the sidenav/toolbar avatar updates
              // immediately, without a page reload.
              this.accountService.authenticate(this.currentAccount);
            }
            this.pictureUploading.set(false);
          },
          error: () => {
            this.pictureError.set('Upload succeeded, but the picture could not be linked to your account.');
            this.pictureUploading.set(false);
          },
        });
      },
      error: () => {
        this.pictureError.set('Upload failed. Please try again.');
        this.pictureUploading.set(false);
      },
    });
  }

  save(): void {
    this.success.set(false);
    this.error.set(false);

    if (!this.currentAccount) {
      return;
    }

    const { firstName, lastName, email, phone } = this.profileForm.getRawValue();
    const updatedAccount: Account = {
      ...this.currentAccount,
      firstName,
      lastName,
      email,
      imageUrl: this.currentImageUrl(),
    };

    this.accountService.save(updatedAccount).subscribe({
      next: () => {
        this.currentAccount = updatedAccount;
        this.accountService.authenticate(updatedAccount);

        if (this.hasEmployeeRecord()) {
          this.profileService.updatePhone(phone).subscribe({
            next: () => this.success.set(true),
            error: () => this.error.set(true),
          });
        } else {
          this.success.set(true);
        }
      },
      error: () => this.error.set(true),
    });
  }
}
