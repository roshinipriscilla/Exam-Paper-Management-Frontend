import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpService } from 'src/app/shared/services/http.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent {
  public addNewUserForm!: FormGroup;
  public hide: boolean = true;
  public roleList = [
    { id: 1, role: 'Admin' },
    { id: 2, role: 'Lecturer' },
    { id: 3, role: 'External Examiner' },
  ];
  public departmentList: any = [];
  constructor(
    public formBuilder: FormBuilder,
    private httpService: HttpService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddUserComponent>
  ) {
    this.createUserForm();
  }
  ngOnInit() {
    this.getAllDepartments();
  }
  getAllDepartments() {
    this.httpService.get('/department/getAllDepartments', '').subscribe(
      (res: any) => {
        this.departmentList = res.data;
      },
      (error: any) => {
        console.log(error);
        this.snackBar.open('Something went wrong', 'X', {
          duration: 3000,
        });
        this.dialogRef.close();
      }
    );
  }
  createUserForm() {
    this.addNewUserForm = this.formBuilder.group({
      userName: new FormControl('', [Validators.required]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,4}'),
      ]),
      role: new FormControl('', [Validators.required]),
      department: new FormControl('', [Validators.required]),
    });
  }
  submit() {
    if (this.addNewUserForm.valid) {
      let reqBody = {
        email: this.addNewUserForm.get('email')?.value.trim(),
        role: this.addNewUserForm.get('role')?.value.trim(),
        userName: this.addNewUserForm.get('userName')?.value.trim(),
        department: this.addNewUserForm.get('department')?.value.trim(),
      };
      this.httpService.post('/user/createUser', reqBody).subscribe(
        (res: any) => {
          this.snackBar.open('USER CREATED SUCCESSFULLY', 'X', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        (error: any) => {
          console.log(error);
          this.snackBar.open(error?.error?.error, 'X', {
            duration: 3000,
          });
          this.dialogRef.close();
        }
      );
    } else {
      this.snackBar.open('USER CREATION FAILED', 'X', {
        duration: 3000,
      });
      this.dialogRef.close();
    }
  }
}
