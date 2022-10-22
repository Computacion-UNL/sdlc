import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Activity } from '@app/_models/activity';
import { Change } from '@app/_models/change';
import { environment } from "@environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ActivityService {
    constructor(private http: HttpClient) { }

    getAll(id: any) {
        return this.http.get<Activity[]>(`${environment.apiURL.v1}/activity/all/${id}`);
    }

    getAllByProject(id: string) {
        return this.http.get<Activity[]>(`${environment.apiURL.v1}/activity/all/project/${id}`);
    }

    getAllActive(id: string) {
        return this.http.get<Activity[]>(`${environment.apiURL.v1}/activity/all/project/active/${id}`);
    }

    getAllByUser() {
        return this.http.get<Activity[]>(`${environment.apiURL.v1}/activity/all/user`);
    }

    getBacklog(id: any) {
        return this.http.get<Activity[]>(`${environment.apiURL.v1}/activity/backlog/${id}`);
    }

    getActivity(id: any) {
        return this.http.get<Activity>(`${environment.apiURL.v1}/activity/${id}`);
    }

    getSubactivities(id: any) {
        return this.http.get<Activity[]>(`${environment.apiURL.v1}/activity/subactivities/${id}`);
    }

    getIncidences(id: any) {
        return this.http.get<Activity[]>(`${environment.apiURL.v1}/activity/incidences/${id}`);
    }

    getChanges(id: any) {
        return this.http.get<Change[]>(`${environment.apiURL.v1}/activity/changes/${id}`);
    }

    add(activity: Activity) {
        return this.http.post(`${environment.apiURL.v1}/activity/create`, activity);
    }

    edit(activity: Activity, id_activity: any) {
        return this.http.put(`${environment.apiURL.v1}/activity/update/${id_activity}`, activity);
    }

    remove(data: any) {
        return this.http.put(`${environment.apiURL.v1}/activity/delete/${data._id}`, data);
    }

    discard(id_activity: string, reason: string) {
        return this.http.put((`${environment.apiURL.v1}/activity/discard/${id_activity}`), { reason });
    }
}
