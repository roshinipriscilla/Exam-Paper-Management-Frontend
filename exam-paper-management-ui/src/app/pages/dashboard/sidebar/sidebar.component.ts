import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  constructor(private router: Router) {}
  showLogoutButton = false;
  public userName = localStorage.getItem('userName');
  public role = localStorage.getItem('role');
  public selectedTab!: String;

  ngOnInit() {}
  onAccountClick() {
    this.showLogoutButton = !this.showLogoutButton;
  }
  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/session/login');
  }
}
