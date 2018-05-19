import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { User } from '../models/index';
import { BaseService } from './base.service';

@Injectable()
export class GitHubService extends BaseService {
    constructor(private http: Http) {
        super();
    }

    getAuthenticationUser() {
        var url = "https://api.github.com/user";

        return this.http.get(url, this.jwt()).map((response: Response) => response);
    }
}