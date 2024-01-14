import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/shared/services/http.service';
import { AddUserComponent } from '../add-user/add-user.component';
export interface userElement {
  Name: string;
  Email: string;
  Role: string;
  Department: any;
}
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  displayedColumns: string[] = ['Name', 'Email', 'Role', 'Department'];
  public dataSource!: MatTableDataSource<userElement>;

  constructor(private httpService: HttpService, public dialog: MatDialog) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.getAllUsers();
  }
  getAllUsers() {
    this.httpService.get('/user/getAllUsers', '').subscribe(
      (res: any) => {
        let userData: any = [];
        res?.data?.forEach((element: any) => {
          userData.push({
            Name: element?.userName,
            Email: element?.email,
            Role: element?.role,
            Department: element?.department?.department,
          });
        });
        this.dataSource = new MatTableDataSource(userData);
        const dataSize = userData.length;
        const pageSizeOptions = [5, 10];
        const maxPageSize = Math.ceil(dataSize / pageSizeOptions[0]);
        const finalPageSizeOptions = Array.from(
          { length: maxPageSize },
          (_, i) => pageSizeOptions[0] * (i + 1)
        );
        this.paginator.pageSizeOptions = finalPageSizeOptions;
        this.paginator.pageSize = finalPageSizeOptions[0];
        this.dataSource.paginator = this.paginator;
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement)?.value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  addUser() {
    let dialogRef = this.dialog.open(AddUserComponent, {
      width: '550px',
      minHeight: 'calc(100vh - 400px)',
      height: 'auto',
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.getAllUsers();
      }
    });
  }
}
