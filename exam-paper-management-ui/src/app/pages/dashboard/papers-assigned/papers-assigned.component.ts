import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AssignPaperComponent } from '../assign-paper/assign-paper.component';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/shared/services/http.service';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { AddDepartmentComponent } from '../add-department/add-department.component';

export interface papersAssigned {
  Department: any;
  Course: any;
  Subject: any;
  Setter: any;
  Checker: any;
  Examiner: any;
  Status: any;
  AssignedDate: any;
  DueDate: any;
  Progress: any;
}
@Component({
  selector: 'app-papers-assigned',
  templateUrl: './papers-assigned.component.html',
  styleUrls: ['./papers-assigned.component.scss'],
})
export class PapersAssignedComponent {
  displayedColumns: string[] = [
    'Department',
    'Course',
    'Subject',
    'Setter',
    'Checker',
    'Examiner',
    'Status',
    'AssignedDate',
    'DueDate',
    'Progress',
  ];
  public role = localStorage.getItem('role');
  public papersForSetter: any = [];
  public papersForReview: any = [];
  public allPapers: any = [];
  public dataSource!: MatTableDataSource<papersAssigned>;
  isLoading = false;

  constructor(
    private httpService: HttpService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngOnInit() {
    this.getAllPapersAssigned();
  }
  public assign() {
    let dialogRef = this.dialog.open(AssignPaperComponent, {
      width: '1000px',
      minHeight: 'calc(100vh - 300px)',
      height: 'auto',
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.getAllPapersAssigned();
      }
    });
  }
  public addDepartment() {
    let dialogRef = this.dialog.open(AddDepartmentComponent, {
      width: '800px',
      minHeight: 'calc(100vh - 600px)',
      height: 'auto',
    });
  }
  public getAllPapersAssigned() {
    this.isLoading = true;
    let userId = localStorage.getItem('userId');
    if (this.role === 'Admin') {
      this.httpService.get('/paper/getAllAssignedPaper', '').subscribe(
        (res: any) => {
          this.allPapers = res?.data;
          this.setPapersAssignedTableData(this.allPapers);
        },
        (error: any) => {
          console.log(error);
        }
      );
    } else {
      this.httpService.get(`/paper/papersAssigned/${userId}`, '').subscribe(
        (res: any) => {
          res.data.forEach((element: any) => {
            if (
              element?.checkerId?._id === userId ||
              element?.examinerId?._id === userId
            ) {
              this.papersForReview.push(element);
            } else {
              this.papersForSetter.push(element);
            }
          });
          if (this.router.url === '/dashboard/papersAssigned') {
            this.setPapersAssignedTableData(this.papersForSetter);
          }
          if (this.router.url === '/dashboard/papersForReview') {
            this.setPapersAssignedTableData(this.papersForReview);
          }
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
    this.isLoading = false;
  }
  public setPapersAssignedTableData(tableData: any) {
    let paperData: any = [];
    tableData.forEach((element: any) => {
      const dueDate = new Date(element?.dueDate);
      const formattedDueDate = `${dueDate?.getDate()}-${
        dueDate?.getMonth() + 1
      }-${dueDate?.getFullYear()}`;
      const assignedDate = new Date(element?.assignedDate);
      const formattedAssignedDate = `${assignedDate?.getDate()}-${
        dueDate?.getMonth() + 1
      }-${dueDate?.getFullYear()}`;
      paperData.push({
        id: element._id,
        Department: element?.department?.department,
        Course: element?.course || '-',
        Subject: element?.subject || '-',
        Setter: element?.setterId?.userName || '-',
        Checker: element?.checkerId?.userName || '-',
        Examiner: element?.examinerId?.userName || '-',
        Status: element?.status || '-',
        AssignedDate: formattedAssignedDate || '-',
        DueDate: formattedDueDate || '-',
        Progress: element?.status ? this.progressCalculate(element?.status) : 0,
      });
      this.dataSource = new MatTableDataSource(paperData);

      const dataSize = paperData.length;
      const pageSizeOptions = [5, 10];
      const maxPageSize = Math.ceil(dataSize / pageSizeOptions[0]);
      const finalPageSizeOptions = Array.from(
        { length: maxPageSize },
        (_, i) => pageSizeOptions[0] * (i + 1)
      );
      this.paginator.pageSizeOptions = finalPageSizeOptions;
      this.paginator.pageSize = finalPageSizeOptions[0];
      this.dataSource.paginator = this.paginator;
    });
  }
  public progressCalculate(status: any) {
    let progress;
    if (status === 'TODO') {
      progress = 0;
    } else if (status === 'IN PROGRESS' || status === 'REVIEW CORRECTIONS') {
      progress = 25;
    } else if (status === 'IN CHECKER REVIEW') {
      progress = 50;
    } else if (status === 'IN EXAMINER REVIEW') {
      progress = 75;
    } else {
      progress = 100;
    }
    return progress;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement)?.value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  public onClickRow(row: any) {
    if (
      this.role === 'Lecturer' &&
      this.router.url === '/dashboard/papersAssigned'
    ) {
      this.router.navigate(['/dashboard/setPaper'], {
        queryParams: {
          data: encodeURIComponent(
            JSON.stringify(
              this.papersForSetter.find((element: any) => element._id === row)
            )
          ),
        },
      });
    }
    if (
      ((this.role === 'Lecturer' || this.role === 'External Examiner') &&
        this.router.url === '/dashboard/papersForReview') ||
      this.role === 'Admin'
    ) {
      this.router.navigate(['/dashboard/reviewPaper'], {
        queryParams: {
          data: encodeURIComponent(
            JSON.stringify(
              this.papersForReview.find((element: any) => element._id === row)
            )
          ),
        },
      });
    }
    if (this.role === 'Admin') {
      this.router.navigate(['/dashboard/reviewPaper'], {
        queryParams: {
          data: encodeURIComponent(
            JSON.stringify(
              this.allPapers.find((element: any) => element._id === row)
            )
          ),
        },
      });
    }
  }
}
