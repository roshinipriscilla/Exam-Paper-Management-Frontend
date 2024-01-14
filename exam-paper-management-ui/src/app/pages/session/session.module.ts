import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'src/assets/material/material/material.module';
import { SetPasswordComponent } from './set-password/set-password.component';
import { LoginGuard } from 'src/app/shared/guard/login.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        canActivate: [LoginGuard],
        component: LoginComponent,
      },
      {
        path: 'set-password',
        component: SetPasswordComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [LoginComponent, SetPasswordComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes)],
})
export class SessionModule {}
