import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { User } from '@app/_models/user';
import { environment } from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<User[]>(`${environment.apiURL.v1}/user/all`);
  }

  get(id: any) {
    return this.http.get<User>(`${environment.apiURL.v1}/user/${id}`);
  }

  updateStatus(id: any, status: boolean) {
    let user;
    status ? user = { active: true } : user = { active: false };
    return this.http.put(`${environment.apiURL.v1}/user/update-status/${id}`, user);
  }

  searchUsers(search) {
    let data = { search: search };
    return this.http.post(`${environment.apiURL.v1}/user/search`, data);
  }

}
