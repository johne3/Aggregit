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

    constructor(private router: Router,
        private gitHubService: GitHubService) {
        this.loggedInUser = { login: "", name: "", avatarUrl: "" };
        this.selectedUser = { login: "", name: "", avatarUrl: "" };
        this.organizations = new Array<Organization>();
        this.issues = new Array<any>();

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

                    this.getData(this.loggedInUser.login);
                });
    }

    selectUser(login: string, name: string, avatarUrl: string) {
        this.selectedUser = { login: login, name: name, avatarUrl: avatarUrl };
        this.getData(login);
    }

    signOut() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');

        this.router.navigate(['/login']);
    }

    getData(login: string) {
        this.gitHubService.getIssues(login)
            .subscribe(data => {
                //this.selectedUser = { login: login, name: "", avatarUrl: "" };

                var tempIssues = data as Array<any>;
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
}
