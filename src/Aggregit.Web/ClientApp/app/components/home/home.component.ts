import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { User } from '../../models/index'
import { GitHubService } from '../../services';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
    public gitHubUser: any;

    constructor(private router: Router,
        private gitHubService: GitHubService) {
        this.gitHubUser = { login: "" };

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
                    this.gitHubUser = JSON.parse(data.text());
                },
                error => {
                    console.log("error");
                });
    }

    signOut() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');

        this.router.navigate(['/login']);
    }
}
