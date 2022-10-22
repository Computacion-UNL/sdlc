import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Setting } from "@app/_models/setting";
import { environment } from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  constructor(private http: HttpClient) { }
  
  getAll() {
    return this.http.get<Setting[]>(`${environment.apiURL.v1}/setting/all`);
  }

  get(slug: string) {
    return this.http.get<Setting>(`${environment.apiURL.v1}/setting/get/${slug}`);
  }

  add(slug: string,setting: Setting) {
    return this.http.post(`${environment.apiURL.v1}/setting/create/${slug}`, setting);
  }
}