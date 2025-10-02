import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import {MatCardModule} from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NavRoute, Permission, routes } from 'src/app/app.routes';
import { OAuth2ProfileService } from 'src/app/services/profile.service';
import { ProfileType } from 'src/app/models/profile';
import { MatGridListModule } from '@angular/material/grid-list';
import { BehaviorSubject, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

@Component({
    standalone: true,
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    imports: [
      CommonModule, 
      RouterLink,
      MatCardModule, 
      MatIconModule, 
      MatButtonModule,
      MatListModule, 
      MatGridListModule ]
})
export class HomeComponent implements OnInit {
  loginDisplay = false;
  isProdEnv = environment.production;

  inSubPage$ = new BehaviorSubject<boolean>(false);
  isAdmin = false;
  isUser = false;

  constructor(
    private authService: MsalService,
    private profileOAuthSvc: OAuth2ProfileService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.setLoginDisplay();

    this.profileOAuthSvc.getProfile().subscribe((profile: ProfileType) => {
      const idTokenClaims = profile?.idTokenClaims || {} as any;
      const userGroups: string[] = idTokenClaims?.groups || [];
      
      this.isAdmin = userGroups.indexOf(Permission.ADMIN) >= 0;
      this.isUser = userGroups.indexOf(Permission.USER) >= 0;
    });

    this.inSubPage$.next((this.activatedRoute.children || []).length > 0);
    this.router.events.subscribe((event:any) => {
      if (event instanceof NavigationEnd) {
        // Check the current URL
        const urls = this.router.url.replace(/^\/|\/$/g, '').split('/');
        this.inSubPage$.next(urls.length > 1);
      }
    });
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }
}
