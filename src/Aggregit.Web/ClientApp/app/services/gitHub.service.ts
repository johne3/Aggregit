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
            "query": `{
                        user(login: \"` + user.login + `\") {
                            organizations(first: 100) {
                                nodes {
                                    login
                                    avatarUrl        
                                    members(first: 100) {
                                        nodes {
                                            login
                                            name
                                            avatarUrl
                                        }
                                    }
                                }
                            }
                        }
                      }`
        };

        return this.http.post(url, JSON.stringify(query), this.jwt()).map((response: Response) => response.json().data.user.organizations.nodes);
    }

    getIssues(user: GitHubUser) {
        var url = "https://api.github.com/graphql";
        var query = {
            "query": `{
                        search(query:\"assignee:` + user.login + ` is:issue state:open\", type:ISSUE, first:100) {
                            nodes {
                                ...on Issue {
                                    title
                                    url
                                    state
                                    repository {
                                        name
                                    }
                                    labels(first:10) {
                                        nodes {
                                            name
                                            color
                                        }
                                    }
                                }
                            }
                        }
                      }`
        };

        return this.http.post(url, JSON.stringify(query), this.jwt()).map((response: Response) => response.json().data.search.nodes);
    }

    getAuthoredPullRequests(user: GitHubUser) {
        var url = "https://api.github.com/graphql";
        var query = {
            "query": `{
                            user(login: \"` + user.login + `\") {
                                pullRequests(first: 100, , states:OPEN) {
                                    nodes{
                                        title
                                        url
                                        repository {
                                            name
                                        }
                                        mergeable
                                        assignees(first: 5) {
                                            nodes {
                                                login
                                            }
                                        }
                                        labels(first:20){
                                        nodes {
                                            name,
                                            color
                                        }
                                    }
                                }
                            }
                        }
                      }`
        };

        return this.http.post(url, JSON.stringify(query), this.jwt()).map((response: Response) => response.json().data.user.pullRequests.nodes);
    }

    getAssignedPullRequests(user: GitHubUser) {
        var url = "https://api.github.com/graphql";
        var query = {
            "query": `{
                        search(query:\"assignee:` + user.login + ` is:pr state:open", type: ISSUE, first: 100) {
                            nodes {
                                ... on PullRequest {
                                    title
                                    url
                                    state
                                    repository {
                                        name
                                    }
                                    labels(first: 5) {
                                        nodes {
                                            name
                                            color
                                        }
                                    }
                                }
                            }
                        }
                      }`
        };

        return this.http.post(url, JSON.stringify(query), this.jwt()).map((response: Response) => response.json().data.search.nodes);
    }
}