import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Role } from '@app/_models/role';
import { environment } from "@environments/environment";

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    constructor(private http: HttpClient) { }

    getAll(project: any) {
        return this.http.get<Role[]>(`${environment.apiURL.v1}/role/all/${project}`);
    }

    add(role: Role) {
        return this.http.post(`${environment.apiURL.v1}/role/create`, role);
    }

    edit(role: Role, id_role: any) {
        return this.http.put(`${environment.apiURL.v1}/role/update/${id_role}`, role);
    }

    remove(id: any) {
        return this.http.put(`${environment.apiURL.v1}/role/delete/${id}`, id);
    }
}
