import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

import { User } from "@app/_models/user";
import { environment } from "@environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<any>(`${environment.apiURL.v1}/auth/signin`, { email, password })
            .pipe(map(user => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    register(data: User) {
        return this.http.post(`${environment.apiURL.v1}/auth/signup`, data);
    }

    refreshData() {
        return this.http.get<User>(`${environment.apiURL.v1}/auth/get-data`)
            .pipe(map(user => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
    
    recovery(email: string) {
        return this.http.post(`${environment.apiURL.v1}/auth/recovery`, { email });
    }

    verify(token: string, email: string) {
        return this.http.post(`${environment.apiURL.v1}/auth/verify/${email}`, { token });
    }

    resend(email: string) {
        return this.http.post(`${environment.apiURL.v1}/auth/resend`, { email });
    }
}
