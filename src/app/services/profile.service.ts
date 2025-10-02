import { Injectable } from '@angular/core';
import { ProfileType } from '../models/profile';
import { HttpClient } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo } from '@azure/msal-browser';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OAuth2ProfileService {

  private userProfile?: ProfileType = undefined;

  constructor(private http: HttpClient, private authService: MsalService) { }

  getProfile(): Observable<ProfileType> {
     if(this.userProfile){
      return of(this.userProfile);
     }
     else{
      return this.http.get(environment.apiConfig.uri).pipe(
        map((profile: any) => {
        let userInfo: AccountInfo = this.authService.instance.getAllAccounts()[0];
        let email = userInfo.idTokenClaims?.emails ? userInfo.idTokenClaims?.emails[0] : profile.mail;
        this.userProfile = {
          id: userInfo.username,
          name: userInfo.name,
          email: email,
          idTokenClaims: userInfo.idTokenClaims
        };
        return this.userProfile;
      }));
     }
    }
}
