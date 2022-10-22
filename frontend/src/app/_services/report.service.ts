import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from "@environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    constructor(private http: HttpClient) { }

    getInformation(id: any) {
        return this.http.get(`${environment.apiURL.v1}/report/info/${id}`);
    }

    generateReport(id: any) {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/pdf');
        return this.http.get(`${environment.apiURL.v1}/report/generate/${id}`, { headers: headers, responseType: 'blob' });
    }

    generateIterationReport(id: any) {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/pdf');
        return this.http.get(`${environment.apiURL.v1}/report/generate-iteration/${id}`, { headers: headers, responseType: 'blob' });
    }
}
