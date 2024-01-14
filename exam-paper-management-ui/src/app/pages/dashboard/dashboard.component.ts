import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UsersComponent } from './users/users.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  constructor(private router: Router) {}
}
