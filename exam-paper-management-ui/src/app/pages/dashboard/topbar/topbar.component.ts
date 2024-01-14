import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpService } from 'src/app/shared/services/http.service';
import { SocketService } from 'src/app/socket.service';

export interface Notification {
  _id: string;
  staffId: string;
  message: string;
  isViewed: boolean;
}

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  public unreadNotificationCount: number = 0;
  public notificationData: Notification[] = [];
  public notifications: Notification[] = [];
  constructor(
    private httpService: HttpService,
    public dialog: MatDialog,
    private socketService: SocketService
  ) {}
  ngOnInit() {
    this.socketService.getNewMessage().subscribe((res: any) => {
      if (res?.staffId === localStorage.getItem('userId')) {
        this.getNotification();
      }
    });
    this.getNotification();
  }

  getNotification() {
    this.httpService
      .get(`/notification/${localStorage.getItem('userId')}`, '')
      .subscribe(
        (res: any) => {
          if (res?.data?.length) {
            this.notificationData = res?.data?.filter(
              (temp: any) => !temp.isViewed
            );
            this.unreadNotificationCount = this.notificationData.length;
          }
        },
        (error: any) => {
          console.log(error);
        }
      );
  }

  updateNotification() {
    this.httpService
      .get(`/notification/update/${localStorage.getItem('userId')}`, '')
      .subscribe(
        (res: any) => {
          this.unreadNotificationCount = 0;
        },
        (error: any) => {
          console.log(error);
        }
      );
  }
}
