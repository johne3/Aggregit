import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { User } from '../models/index';
import { BaseService } from './base.service';
import 'rxjs/add/operator/map';
import { GitHubUser, Organization } from '../models/github.service/index';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GitHubService extends BaseService {
    constructor(private http: Http) {
        super();
    }

    getAuthenticatedUser() {
        var url = "https://api.github.com/user";
        return this.http.get(url, this.jwt()).map((response: Response) => response.json());
    }

    getOrganizations(user: GitHubUser): Observable<Array<Organization>> {
        var url = "https://api.github.com/graphql";
        var query = {
            "query": "{\n  user(login: \"johne3\") {\n    organizations(first: 100) {\n      nodes {\n        login\n        avatarUrl\n        members(first: 100) {\n          nodes {\n            login\n            name\n            avatarUrl\n          }\n        }\n      }\n    }\n  }\n}\n"
        };

        return this.http.post(url, JSON.stringify(query), this.jwt()).map((response: Response) => response.json().data.user.organizations.nodes);
    }

    getIssues(login: string) {
        var url = "https://api.github.com/graphql";
        var query = {
            "query": "{\n  search(query:\"assignee:" + login + " is:issue state:open\", type:ISSUE, first:100){\n    nodes {\n      ...on Issue {\n        title\n        url\n        state\n        repository {\n          name\n        }\n        labels(first:5){\n          nodes{\n            name\n            color\n          }\n        }\n      }\n    }\n  }\n}\n"
        };

        return this.http.post(url, JSON.stringify(query), this.jwt()).map((response: Response) => response.json().data.search.nodes);
    }

    //getData(login:string) {
    //    var url = "https://api.github.com/graphql";
    //    var query = {
    //        "query": "{\n  user(login: \"" + login + "\") {\n    login,\n    avatarUrl,\n    name,\n    issues(first:100, states:OPEN){\n      nodes {\n        url,\n        title,\n        state,\n        labels(first:100){\n          nodes {\n            name,\n            color\n          }\n        }\n        repository{\n          name\n        }\n      }\n    }\n    pullRequests(first: 100, states: OPEN){\n      nodes {\n        title\n      }\n    }\n    organizations(first: 100) {\n      nodes {\n        login\n        avatarUrl\n        members(first: 100) {\n          nodes {\n            login\n            name\n            avatarUrl\n          }\n        }\n      }\n    }\n  }\n}\n"
    //    };

    //    return this.http.post(url, JSON.stringify(query), this.jwt()).map((response: Response) => response.json().data.user);
    //}
}