import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpService } from 'src/app/shared/services/http.service';

@Component({
  selector: 'app-assign-paper',
  templateUrl: './assign-paper.component.html',
  styleUrls: ['./assign-paper.component.scss'],
})
export class AssignPaperComponent {
  public addPaperForm!: FormGroup;
  public departmentList: any = [];
  public courseList: any = [];
  public subjectList: any = [];
  public lecturersList: any = [];
  public examinersList: any = [];
  selectedDepartment: string | null = null;
  selectedCourse: string | null = null;
  selectedDate: Date | undefined;
  dateError: boolean = false;
  constructor(
    public formBuilder: FormBuilder,
    private httpService: HttpService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AssignPaperComponent>
  ) {
    this.createPaperForm();
  }
  ngOnInit() {
    this.getAllDepartments();
  }
  createPaperForm() {
    this.addPaperForm = this.formBuilder.group(
      {
        department: new FormControl('', [Validators.required]),
        course: new FormControl('', [Validators.required]),
        subject: new FormControl('', [Validators.required]),
        setter: new FormControl('', [Validators.required]),
        examiner: new FormControl('', [Validators.required]),
        checker: new FormControl('', [Validators.required]),
        dueDate: new FormControl('', [Validators.required]),
      },
      { validators: this.checkerSetterValidator }
    );
  }
  onDateChange(event: any) {
    let currentDate = new Date();
    this.selectedDate = event?.value;
    if (this.selectedDate && this.selectedDate <= currentDate) {
      this.dateError = true;
    } else {
      this.dateError = false;
    }
  }
  checkerSetterValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const checkerValue = control.get('checker')?.value;
    const setterValue = control.get('setter')?.value;
    if (checkerValue === setterValue) {
      return { sameValue: true };
    }
    return null;
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
  getAllUsers(departmentId: any) {
    this.httpService.get('/user/getAllUsers', '').subscribe(
      (res: any) => {
        let usersData = res?.data?.filter(
          (item: any) => item?.department?._id === departmentId
        );
        this.lecturersList = usersData.filter(
          (user: any) => user.role === 'Lecturer'
        );
        this.examinersList = usersData.filter(
          (user: any) => user.role === 'External Examiner'
        );
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
  onDepartmentChange(value: any) {
    this.selectedDepartment = value;
    const department = this.departmentList.find(
      (dept: any) => dept._id === this.selectedDepartment
    );
    this.courseList = department ? department.courses : [];
    this.addPaperForm.get('course')?.setValue(null);
    this.getAllUsers(value);
  }

  onCourseChange(value: any) {
    this.selectedCourse = value;
    const course = this.courseList.find(
      (course: any) => course.course === this.selectedCourse
    );
    this.subjectList = course ? course.subjects : [];
    this.addPaperForm.get('subject')?.setValue(null);
  }

  submit() {
    if (this.addPaperForm.valid) {
      let reqBody = {
        department: this.addPaperForm.get('department')?.value.trim(),
        course: this.addPaperForm.get('course')?.value.trim(),
        subject: this.addPaperForm.get('subject')?.value.trim(),
        setterId: this.addPaperForm.get('setter')?.value.trim(),
        checkerId: this.addPaperForm.get('checker')?.value.trim(),
        examinerId: this.addPaperForm.get('examiner')?.value.trim(),
        dueDate: this.addPaperForm.get('dueDate')?.value,
      };
      this.httpService.post('/paper/assignPaper', reqBody).subscribe(
        (res: any) => {
          this.snackBar.open('PAPER ASSIGNED SUCCESSFULLY', 'X', {
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
      this.snackBar.open('PAPER ASSIGNING FAILED', 'X', {
        duration: 3000,
      });
      this.dialogRef.close();
    }
  }
}
