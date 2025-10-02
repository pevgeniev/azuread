import { Component, OnInit } from '@angular/core';
import { ProfileType } from '../../models/profile';
import { OAuth2ProfileService } from 'src/app/services/profile.service';
import { ProfileService, User } from 'src/app/backend';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profile: ProfileType | undefined;
  public user: User = {};
  
  constructor(private profileOAuthSvc: OAuth2ProfileService,
    private profileSvc: ProfileService
  ) {}

  ngOnInit() {
    this.getProfile();
  }

  getProfile() {
    this.profileOAuthSvc.getProfile().subscribe((profile: ProfileType) => {
      this.profile = profile;
    });
    this.profileSvc.getUser().subscribe((user) => {
      this.user = user;
    });
  }
}
