import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from '@app/_models/user';
import { environment } from "@environments/environment";

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    users: User[];

    constructor(private http: HttpClient) { }

    updateAccount(user: User) {
        return this.http.put(`${environment.apiURL.v1}/account/update/${user.id}`, user);
    }

    changePassword(data: any) {
        return this.http.put(`${environment.apiURL.v1}/account/update-password/${data.id}`, data);
    }

    uploadImage(id: any, image: File): Observable<any> {
        const formData = new FormData();
        formData.append("image", image, image.name);
        return this.http.put(`${environment.apiURL.v1}/account/upload-image/${id}`, formData);
    }

    deleteImage(id: any) {
        return this.http.put(`${environment.apiURL.v1}/account/delete-image/${id}`, {});
    }

}
