import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Project } from '@app/_models/project';
import { environment } from "@environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    public name: string = '';

    constructor(private http: HttpClient) { }

    getAllProjectsByUser(options) {
        return this.http.post<Project[]>(`${environment.apiURL.v1}/project/all/`,options);
    }

    searchProjects(search: string) {
        let data = { search: search };
        return this.http.post<Project[]>(`${environment.apiURL.v1}/project/search`, data);
    }

    get(id: any) {
        return this.http.get<Project>(`${environment.apiURL.v1}/project/${id}`);
    }

    add(project: Project) {
        return this.http.post(`${environment.apiURL.v1}/project/create`, project);
    }

    edit(project: Project) {
        return this.http.put(`${environment.apiURL.v1}/project/update/${project.id}`, project);
    }

    uploadImage(id: any, image: File): Observable<any> {
        const formData = new FormData();
        formData.append("image", image, image.name);
        return this.http.put(`${environment.apiURL.v1}/project/upload-image/${id}`, formData);
    }

    deleteImage(id: any) {
        return this.http.put(`${environment.apiURL.v1}/project/delete-image/${id}`, {});
    }

    remove(id: any) {
        return this.http.put(`${environment.apiURL.v1}/project/delete/${id}`, id);
    }
}
