import { Headers, RequestOptions } from '@angular/http';
import { User } from '../models/index'

export class BaseService {

    protected jwt() {
        // create authorization header with jwt token
        let t = localStorage.getItem('currentUser');
        let headers = new Headers();
        headers.append("Content-Type", "application/json");

        let currentUser: User;

        if (t) {
            currentUser = JSON.parse(t.valueOf());

            if (currentUser && currentUser.accessToken) {
                headers.append('Authorization', 'Bearer ' + currentUser.accessToken);
            }
        }

        return new RequestOptions({ headers: headers });
    }
}