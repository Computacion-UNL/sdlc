import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Member } from '@app/_models/member';
import { Project } from '@app/_models/project';
import { environment } from "@environments/environment";

@Injectable({
    providedIn: 'root'
})
export class MemberService {
    constructor(private http: HttpClient) { }

    getAll(project: any) {
        return this.http.get<Member[]>(`${environment.apiURL.v1}/collaborator/all/${project}`);
    }

    getProjectsByUser(id: string) {
        return this.http.get<Project[]>(`${environment.apiURL.v1}/collaborator/all-projects/${id}`);
    }

    getMember(project: string, member: string) {
        return this.http.get<Member>(`${environment.apiURL.v1}/collaborator/get/${project}/${member}`);
    }

    searchProjectsByUser(search: string, id:string) {
        let data = { search: search };
        return this.http.post(`${environment.apiURL.v1}/collaborator/search-projects/${id}`, data);
    }

    invitation(id: string) {
        return this.http.get<Member[]>(`${environment.apiURL.v1}/collaborator/invitation/${id}`);
    }

    add(member: Member) {
        return this.http.post(`${environment.apiURL.v1}/collaborator/create`, member);
    }

    edit(member: Member) {
        return this.http.put(`${environment.apiURL.v1}/collaborator/update/${member.id}`, member);
    }

    remove(id: any) {
        return this.http.put(`${environment.apiURL.v1}/collaborator/delete/${id}`, id);
    }
}
