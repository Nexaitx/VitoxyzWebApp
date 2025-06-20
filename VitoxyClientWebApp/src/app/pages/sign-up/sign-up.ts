import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; //  Added HttpClient
import { environment } from '../../../../src/environments/environment.development';

// Password Match Validator
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (!password || !confirmPassword) return null;
  return password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    RouterLink
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss'
})
export class SignUp {
  signupForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  private router = inject(Router);
  private http = inject(HttpClient);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        userName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      const confirmPasswordCtrl = this.signupForm.get('confirmPassword');
      if (confirmPasswordCtrl?.hasError('passwordMismatch')) {
        confirmPasswordCtrl.setErrors({ passwordMismatch: true });
      }
      console.log('❌ Form is invalid.');
      return;
    }

    const {
      userName,
      email,
      phoneNumber,
      address,
      city,
      pinCode,
      password,
      confirmPassword
    } = this.signupForm.value;

    const signupPayload = {
      userName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      address,
      city,
      pinCode: Number(pinCode)
    };

    //post to backend API
 this.http.post(`${environment.apiBaseUrl}api/user/singup`,
  signupPayload,
  {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true
  }
).subscribe({
  next: (res) => {
    console.log('✅ Signup successful:', res);
    alert('Signup successful! Now redirecting...');
    this.router.navigate(['/login']);
  },
  error: (err) => {
    console.error('❌ Signup failed:', err);
    alert('Signup failed. Please try again.');
  }
});

  }
}
