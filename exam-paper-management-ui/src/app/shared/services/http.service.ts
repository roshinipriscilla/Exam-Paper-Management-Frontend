import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}
  post(endUrl: string, reqBody: any) {
    const url: string = environment.apiUrl + endUrl;

    return this.http.post<any>(url, reqBody);
  }

  get(endUrl: string, params: any) {
    const url: string = environment.apiUrl + endUrl;

    return this.http.get<any>(url, { params });
  }
}
