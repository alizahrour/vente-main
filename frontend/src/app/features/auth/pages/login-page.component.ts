import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  readonly form;

  submitting = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.form = this.fb.nonNullable.group({
      username: ['agent', Validators.required],
      password: ['agent123', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.authService.login(this.form.getRawValue())
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          const user = this.authService.getCurrentUserSnapshot();
          this.router.navigate([user?.role === 'SUPERVISOR' ? '/dashboard' : '/customers']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message ?? 'Connexion impossible.';
        },
      });
  }

  quickLogin(username: string, password: string): void {
    this.form.patchValue({ username, password });
    this.submit();
  }
}
