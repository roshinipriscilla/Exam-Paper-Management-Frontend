import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHeaders,
  HttpClient,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable()
export class Interceptor implements HttpInterceptor {
  constructor(private http: HttpClient, private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        Authorization: `${localStorage.getItem('accessToken')}`,
        'Access-Control-Allow-Origin': '*',
      },
    });

    return next.handle(request).pipe(
      catchError((error: any) => {
        if (error.status === 401 && !request.url.includes('getAccessToken')) {
          return this.http
            .post<any>(
              `${environment.apiUrl}/user/getAccessToken`,
              {
                accessToken: localStorage.getItem('accessToken'),
              },
              {
                headers: new HttpHeaders({
                  token: `${localStorage.getItem('refreshToken')}`,
                }),
              }
            )
            .pipe(
              switchMap((res: any) => {
                localStorage.setItem('accessToken', res?.accessToken);
                return next.handle(
                  request.clone({
                    setHeaders: {
                      authorization: res?.accessToken,
                    },
                  })
                );
              }),
              catchError((error: any) => {
                console.log(error);
                localStorage.clear();
                this.router.navigateByUrl('/session/login');
                return throwError(error);
              })
            );
        } else {
          this.router.navigateByUrl('/session/login');
          return throwError(error);
        }
      })
    );
  }
}
