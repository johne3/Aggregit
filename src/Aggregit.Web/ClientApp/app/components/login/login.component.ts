import { Component } from '@angular/core';
import { Http } from '@angular/http';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    login() {
        var clientId = localStorage.getItem("clientId");
        var scopes = "repo, user, read:org";
        var authUrl = "https://github.com/login/oauth/authorize?client_id=" + clientId + "&scope=" + scopes;

        window.location.href = authUrl;
    }
}
