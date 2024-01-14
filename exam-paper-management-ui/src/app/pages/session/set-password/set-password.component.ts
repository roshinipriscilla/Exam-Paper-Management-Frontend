import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/shared/services/http.service';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
})
export class SetPasswordComponent {
  hidePassword = true;
  hideConfirmPassword = true;
  public setPasswordForm!: FormGroup;
  public email: String | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private httpService: HttpService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'];
    });
    this.initSetPasswordForm();
  }
  private initSetPasswordForm() {
    this.setPasswordForm = this.formBuilder.group({
      password: new FormControl('', [
        Validators.required,
        Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'),
      ]),
    });
  }

  onSubmit() {
    if (this.email) {
      let reqBody = {
        password: this.setPasswordForm.get('password')?.value,
        email: this.email,
      };

      this.httpService.post('/user/setPassword', reqBody).subscribe(
        (res) => {
          this.snackBar.open('Password Stored Successfully', 'X', {
            duration: 3000,
          });
          localStorage.clear();
          this.router.navigateByUrl('/session/login');
        },
        (error) => {
          this.snackBar.open(error?.error?.error, 'X', {
            duration: 3000,
          });
        }
      );
    } else {
      this.snackBar.open('INVALID EMAIL', 'X', {
        duration: 3000,
      });
    }
  }
}
