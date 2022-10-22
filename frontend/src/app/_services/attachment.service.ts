import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Attachment } from '@app/_models/attachment';
import { environment } from "@environments/environment";

@Injectable({
    providedIn: 'root'
})
export class AttachmentService {
    constructor(private http: HttpClient) { }

    getAll(activity: any) {
        return this.http.get<Attachment[]>(`${environment.apiURL.v1}/attachment/all/${activity}`);
    }

    add(attachment: Attachment) {
        if (attachment.type === 'file') {
            return this.http.post(`${environment.apiURL.v1}/attachment/create`, this.setFileAttachmentData(attachment));
        } else {
            return this.http.post(`${environment.apiURL.v1}/attachment/create`, attachment);
        }
    }

    edit(attachment: Attachment, id_Attachment: any) {
        if ((attachment.type === 'file' && attachment.url) || attachment.type === 'url') {
            return this.http.put(`${environment.apiURL.v1}/attachment/update/${id_Attachment}`, attachment);
        } else {
            return this.http.put(`${environment.apiURL.v1}/attachment/update/${id_Attachment}`, this.setFileAttachmentData(attachment));
        }
    }

    remove(id: any) {
        return this.http.put(`${environment.apiURL.v1}/attachment/delete/${id}`, id);
    }

    getFile(file: string) {
        return this.http.get(`${file}`, { responseType: 'blob' });
    }

    private setFileAttachmentData(attachment: Attachment) {
        const formData = new FormData();
        formData.append("file", attachment.file, attachment.file.name);
        formData.append("name", attachment.name);
        formData.append("type", attachment.type);
        formData.append("activity", attachment.activity);
        formData.append("url", (attachment.url) ? attachment.url : '');
        return formData;
    }
}
