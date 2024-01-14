import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { UsersComponent } from './users/users.component';
import { MaterialModule } from 'src/assets/material/material/material.module';
import { AddUserComponent } from './add-user/add-user.component';
import { HomeComponent } from './home/home.component';
import { AssignPaperComponent } from './assign-paper/assign-paper.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthGuard } from 'src/app/shared/guard/auth.guard';
import { PapersAssignedComponent } from './papers-assigned/papers-assigned.component';
import { TopbarComponent } from './topbar/topbar.component';
import { SetPaperComponent } from './set-paper/set-paper.component';
import { ReviewPaperComponent } from './review-paper/review-paper.component';
import { CanDeactivateGuard } from 'src/app/shared/guard/form.guard';
import { AddDepartmentComponent } from './add-department/add-department.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'papersForReview',
        pathMatch: 'full',
      },
      {
        path: 'home',
        canActivate: [AuthGuard],
        component: HomeComponent,
      },
      {
        path: 'users',
        canActivate: [AuthGuard],
        component: UsersComponent,
      },
      {
        path: 'papersAssigned',
        canActivate: [AuthGuard],
        component: PapersAssignedComponent,
      },
      {
        path: 'papersForReview',
        canActivate: [AuthGuard],
        component: PapersAssignedComponent,
      },
      {
        path: 'setPaper',
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard],
        component: SetPaperComponent,
      },
      {
        path: 'reviewPaper',
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard],
        component: ReviewPaperComponent,
      },
    ],
  },
];
@NgModule({
  declarations: [
    DashboardComponent,
    UsersComponent,
    AddUserComponent,
    HomeComponent,
    AssignPaperComponent,
    SidebarComponent,
    PapersAssignedComponent,
    TopbarComponent,
    SetPaperComponent,
    ReviewPaperComponent,
    AddDepartmentComponent,
  ],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes)],
  providers: [CanDeactivateGuard],
})
export class DashboardModule {}
