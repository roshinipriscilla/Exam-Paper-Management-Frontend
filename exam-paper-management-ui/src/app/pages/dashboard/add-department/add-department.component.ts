import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpService } from 'src/app/shared/services/http.service';
import { AddUserComponent } from '../add-user/add-user.component';

@Component({
  selector: 'app-add-department',
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.scss'],
})
export class AddDepartmentComponent implements OnInit {
  public addNewDeptForm!: FormGroup;
  public courses: any = new FormArray([]);

  constructor(
    public formBuilder: FormBuilder,
    private httpService: HttpService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddDepartmentComponent>
  ) {
    this.createDeptForm();
  }

  ngOnInit() {}
  createDeptForm() {
    this.addNewDeptForm = this.formBuilder.group({
      department: new FormControl('', [Validators.required]),
      coursesArray: this.courses,
    });
    this.addCourse();
  }

  addCourse() {
    this.courses.push(
      this.formBuilder.group({
        course: ['', Validators.required],
        subjects: this.formBuilder.array([
          this.formBuilder.control('', Validators.required),
        ]),
      })
    );
  }

  removeCourse(index: number) {
    this.courses.removeAt(index);
  }

  addSubject(courseIndex: number): void {
    let subjects = this.courses.at(courseIndex).get('subjects') as FormArray;
    subjects.push(this.formBuilder.control('', Validators.required));
  }

  removeSubject(courseIndex: number, subjectIndex: number): void {
    const subjects = this.courses.at(courseIndex).get('subjects') as FormArray;
    subjects.removeAt(subjectIndex);
  }
  submit() {
    if (this.addNewDeptForm.valid) {
      let reqBody = {
        department: this.addNewDeptForm.get('department')?.value.trim(),
        course: this.courses.value,
      };
      console.log(reqBody);

      this.httpService.post('/department/addDepartments', reqBody).subscribe(
        (res: any) => {
          this.snackBar.open('DEPARTMENT ADDED SUCCESSFULLY', 'X', {
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
      this.snackBar.open('DEPARTMENT CREATION FAILED', 'X', {
        duration: 3000,
      });
      this.dialogRef.close();
    }
  }
}
