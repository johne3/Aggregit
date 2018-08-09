import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { User } from '../../models/index'
import { GitHubService } from '../../services';
import { GitHubUser, Organization } from '../../models/github.service/index'

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
    public loggedInUser: GitHubUser;
    public organizations: Organization[];
    public selectedUser: GitHubUser;
    public issues: any[];
    public authoredPullRequests: any[];
    public assignedPullRequests: any[];

    constructor(private router: Router,
        private gitHubService: GitHubService) {
        this.loggedInUser = { login: "", name: "", avatarUrl: "" };
        this.selectedUser = { login: "", name: "", avatarUrl: "" };
        this.organizations = new Array<Organization>();
        this.issues = new Array<any>();
        this.authoredPullRequests = new Array<any>();
        this.assignedPullRequests = new Array<any>();

        var accessToken = window.localStorage.getItem('accessToken');
        let currentUserValue = localStorage.getItem('currentUser');
        let currentUser: User;

        if (currentUserValue) {
            currentUser = JSON.parse(currentUserValue.valueOf());

            if (!currentUser || !currentUser.accessToken) {
                this.router.navigate(['/login']);
                return;
            }
        } else if (accessToken) {
            let user = new User();
            user.accessToken = accessToken;
            localStorage.setItem('currentUser', JSON.stringify(user))
        } else {
            this.router.navigate(['/login']);
            return;
        }

        this.gitHubService.getAuthenticatedUser()
            .subscribe(
                data => {
                    this.loggedInUser = { login: data.login, name: data.name, avatarUrl: data.avatar_url };
                    this.selectedUser = this.loggedInUser;

                    this.gitHubService.getOrganizations(this.loggedInUser)
                        .subscribe(data => {
                            this.organizations = data;
                        });

                    this.getData(this.selectedUser);
                });
    }

    selectUser(login: string, name: string, avatarUrl: string) {
        this.issues = new Array<any>();
        this.assignedPullRequests = new Array<any>();
        this.authoredPullRequests = new Array<any>();

        this.selectedUser = { login: login, name: name, avatarUrl: avatarUrl };
        this.getData(this.selectedUser);
    }

    signOut() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');

        this.router.navigate(['/login']);
    }

    getData(user: GitHubUser) {
        this.gitHubService.getIssues(user)
            .subscribe(data => {
                var tempIssues = data as Array<any>;

                //TODO: For now, filter out issues with a "Pull Request" label. Make this 
                //more permanent with user/org preferences
                tempIssues = tempIssues.filter(function (issue) {
                    var doesHavePullRequestLabel = issue.labels.nodes.filter(function (label: any) {
                        return label.name === "Pull Request";
                    }).length == 0;

                    return doesHavePullRequestLabel;
                });

                this.issues = tempIssues.sort((item1: any, item2: any) => {
                    if (item1.repository.name < item2.repository.name) {
                        return - 1;
                    }

                    if (item1.repository.name > item2.repository.name) {
                        return 1;
                    }

                    return 0;
                });
            });

        this.gitHubService.getAuthoredPullRequests(user)
            .subscribe(data => {
                var tempPullRequests = data as Array<any>;
                this.authoredPullRequests = tempPullRequests.sort((item1: any, item2: any) => {
                    if (item1.repository.name < item2.repository.name) {
                        return - 1;
                    }

                    if (item1.repository.name > item2.repository.name) {
                        return 1;
                    }

                    return 0;
                });
            });

        this.gitHubService.getAssignedPullRequests(user)
            .subscribe(data => {
                var tempPullRequests = data as Array<any>;
                this.assignedPullRequests = tempPullRequests.sort((item1: any, item2: any) => {
                    if (item1.repository.name < item2.repository.name) {
                        return - 1;
                    }

                    if (item1.repository.name > item2.repository.name) {
                        return 1;
                    }

                    return 0;
                });
            });

        //this.gitHubService.getData(login)
        //    .subscribe(data => {
        //        this.selectedUser = { login: login, name: data.name, avatarUrl: data.avatarUrl };

        //        var tempIssues = data.issues.nodes as Array<any>;
        //        this.issues = tempIssues.sort((item1: any, item2: any) => {
        //            if (item1.repository.name < item2.repository.name) {
        //                return - 1;
        //            }

        //            if (item1.repository.name > item2.repository.name) {
        //                return 1;
        //            }

        //            return 0;
        //        });
        //    });
    }

    getTextColor(label: any) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(label.color);

        if (result != null) {
            var rgb = {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            };

            // http://www.w3.org/TR/AERT#color-contrast
            var o = Math.round(((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000);

            return (o > 125) ? '#000000' : '#FFFFFF';
        }

        return "#FFFFFF";
    }
}
