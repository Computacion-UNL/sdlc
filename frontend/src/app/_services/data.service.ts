import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class DataService {
    private subject = new Subject<any>();

    sendData(project_id: string) {
        this.subject.next(project_id);
    }

    clearData() {
        // this.subject.next();
    }

    getData(): Observable<any> {
        return this.subject.asObservable();
    }
}