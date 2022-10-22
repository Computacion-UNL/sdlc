import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Iteration } from '@app/_models/iteration';
import { environment } from "@environments/environment";

@Injectable({
    providedIn: 'root'
})
export class IterationService {
    constructor(private http: HttpClient) { }

    getAll(project: any) {
        return this.http.get<Iteration[]>(`${environment.apiURL.v1}/iteration/all/${project}`);
    }

    add(iteration: Iteration) {
        return this.http.post(`${environment.apiURL.v1}/iteration/create`, iteration);
    }

    get(id: string) {
        return this.http.get<Iteration>(`${environment.apiURL.v1}/iteration/get/${id}`);
    }

    edit(iteration: Iteration, id_iteration: any) {
        return this.http.put(`${environment.apiURL.v1}/iteration/update/${id_iteration}`, iteration);
    }

    remove(id: any) {
        return this.http.put(`${environment.apiURL.v1}/iteration/delete/${id}`, id);
    }

}
