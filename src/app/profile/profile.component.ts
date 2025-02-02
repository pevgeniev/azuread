import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AccountInfo } from '@azure/msal-browser';
import { MsalService } from '@azure/msal-angular';

type ProfileType = {
  name?: string;
  email?: string;
  id?: string;
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: [],
})
export class ProfileComponent implements OnInit {
  profile: ProfileType | undefined;

  constructor(private http: HttpClient, private authService: MsalService) {}

  ngOnInit() {
    this.getProfile(environment.apiConfig.uri);
  }

  getProfile(url: string) {
    this.http.get(url).subscribe((profile: any) => {

      let userInfo: AccountInfo = this.authService.instance.getAllAccounts()[0];
      let email = userInfo.idTokenClaims?.emails ? userInfo.idTokenClaims?.emails[0] : profile.mail;
      this.profile = {
        id: userInfo.username,
        name: userInfo.name,
        email: email
      };
    });
  }
}
