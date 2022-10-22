import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Commentary } from '@app/_models/commentary';
import { environment } from "@environments/environment";

@Injectable({
    providedIn: 'root'
})
export class CommentaryService {
    constructor(private http: HttpClient) { }

    getAll(activity: any) {
        return this.http.get<Commentary[]>(`${environment.apiURL.v1}/commentary/all/${activity}`);
    }

    add(commentary: Commentary) {
        return this.http.post(`${environment.apiURL.v1}/commentary/create`, commentary);
    }

    edit(commentary: Commentary, id_Commentary: any) {
        return this.http.put(`${environment.apiURL.v1}/commentary/update/${id_Commentary}`, commentary);
    }

    remove(id: any) {
        return this.http.put(`${environment.apiURL.v1}/commentary/delete/${id}`, id);
    }

}
