import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HelpSupportService, SupportRequest } from './help-support.service';

interface FaqItem {
  question: string;
  answer: string;
}

interface HelpLink {
  icon: string;
  title: string;
  description: string;
  url: string;
}

interface ShortcutItem {
  keys: string;
  action: string;
}

@Component({
  selector: 'app-help-support',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './help-support.component.html',
  styleUrl: './help-support.component.scss',
})
export class HelpSupportComponent {
  private readonly fb = inject(FormBuilder);
  private readonly helpSupportService = inject(HelpSupportService);
  private readonly snackBar = inject(MatSnackBar);

  submitting = false;

  // TODO: wire this up to your actual build/version token instead of a hardcoded string.
  readonly appVersion = '1.0.0';

  readonly categories = [
    { value: 'bug', label: 'Report a bug' },
    { value: 'feature', label: 'Request a feature' },
    { value: 'question', label: 'Ask a question' },
    { value: 'other', label: 'Something else' },
  ];

  readonly helpLinks: HelpLink[] = [
    {
      icon: 'menu_book',
      title: 'Documentation',
      description: 'Guides for projects, tasks, teams and notifications.',
      url: 'https://docs.example.com',
    },
    {
      icon: 'campaign',
      title: "What's new",
      description: 'Recent updates and improvements to ProjManage.',
      url: 'https://example.com/changelog',
    },
    {
      icon: 'groups',
      title: 'Community',
      description: 'Ask questions and share feedback with other users.',
      url: 'https://example.com/community',
    },
  ];

  readonly shortcuts: ShortcutItem[] = [
    { keys: 'Ctrl / Cmd + K', action: 'Open quick search' },
    { keys: 'Ctrl / Cmd + N', action: 'Create a new task' },
    { keys: 'G then P', action: 'Go to Projects' },
    { keys: 'G then T', action: 'Go to Tasks' },
    { keys: '?', action: 'Open this Help & Support panel' },
  ];

  readonly faqs: FaqItem[] = [
    {
      question: 'How do I invite a teammate to a project?',
      answer:
        'Open the project, go to the Team tab, and select "Invite member". Enter their email and choose a role - they will receive an invitation email with a link to join.',
    },
    {
      question: 'How do I change the app theme or language?',
      answer:
        'Go to Settings > Preferences. You can switch between System, Light and Dark themes, and change the display language, at any time.',
    },
    {
      question: 'How do I control which notifications I receive?',
      answer:
        'Go to Settings > Notifications, where you can toggle email and in-app alerts separately for deadline reminders, new task assignments, and team changes.',
    },
    {
      question: 'Can I recover a deleted task or project?',
      answer:
        'Deleted items are kept for 30 days before being permanently removed. Contact support with the item name and approximate deletion date and we will help you restore it.',
    },
    {
      question: 'How do I reset my password?',
      answer:
        'From the login screen, select "Forgot password" and follow the emailed reset link. If you are already logged in, you can also change your password from My Profile.',
    },
  ];

  readonly form: FormGroup = this.fb.group({
    category: ['question', Validators.required],
    subject: ['', [Validators.required, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
  });

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload: SupportRequest = this.form.value;

    this.helpSupportService.sendSupportRequest(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open("Thanks - we've received your message.", 'Dismiss', { duration: 4000 });
        this.form.reset({ category: 'question', subject: '', message: '' });
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Something went wrong sending your message. Please try again.', 'Dismiss', {
          duration: 5000,
        });
      },
    });
  }
}
