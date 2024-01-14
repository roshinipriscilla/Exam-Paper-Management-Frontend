import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/shared/services/http.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  hide = true;
  public loginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.initLoginForm();
  }
  private initLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,4}'),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'),
      ]),
    });
  }

  onSubmit() {
    const loginData = this.loginForm.value;
    let reqBody = loginData;
    this.httpService.post('/user/login', reqBody).subscribe(
      (res) => {
        localStorage.setItem('userId', res?.userId);
        localStorage.setItem('userName', res?.userName);
        localStorage.setItem('role', res?.role);
        localStorage.setItem('accessToken', res?.accessToken);
        localStorage.setItem('refreshToken', res?.refreshToken);
        this.snackBar.open('Logged In Successfully', 'X', {
          duration: 3000,
        });
        this.router.navigateByUrl('/dashboard');
      },
      (error) => {
        this.snackBar.open(error?.error?.error, 'X', {
          duration: 3000,
        });
      }
    );
  }
}
