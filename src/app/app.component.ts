import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

import {
  MsalService,
  MsalModule,
  MsalBroadcastService,
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration,
} from '@azure/msal-angular';
import {
  AuthenticationResult,
  InteractionStatus,
  PopupRequest,
  RedirectRequest,
  EventMessage,
  EventType,
} from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Permission, routes } from './app.routes';
import { ProfileType } from './models/profile';
import { OAuth2ProfileService } from './services/profile.service';
import { ProfileService, User } from './backend';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
        CommonModule,
        MsalModule,
        RouterOutlet,
        RouterLink,
        MatToolbarModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatListModule,
        MatProgressBarModule,
        MatToolbarModule
    ]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Angular Standalone Sample - MSAL Angular';
  isIframe = false;
  loginDisplay = false;

  /* navigation, screen size and menu drawer, embeddable routes */ 
  private embeddableRoutes = ['embed'];
  public embedRoute: string | undefined = '';
  isEmbedded = false;
  isEmbeddableRoute = false;
  isHome = false;
  isSmallScreen = false;
  currentRoute: string = '';
  navItems = routes.map(r => { 
    return {
    ...r,
    name: r.title
  }}).filter(r => r.name).sort((a, b) => (a.order??0) - (b.order??0));
  visibleNavs = this.navItems.filter(n => n.title == 'Home');
  profile: ProfileType | undefined;
  
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService, 
    private profileOAuthSvc: OAuth2ProfileService,
    private msalBroadcastService: MsalBroadcastService,
    private breakpointObserver: BreakpointObserver,
    private profileSvc: ProfileService,
    private router: Router
  ) {
    const parameters = new URLSearchParams(window.location.search);
    if(parameters && parameters.get('embed')){
      this.isEmbedded = true;
    }
  }

  mapRoutes(){

    const idTokenClaims = this.profile?.idTokenClaims || {} as any;
    const userGroups: string[] = idTokenClaims?.groups || [];
    this.visibleNavs = (this.navItems || []).filter(ni => !ni.hidden && 
        ( !ni.permissions || ni.permissions.length == 0 || ni.permissions.some(p =>userGroups.includes(p)) ) ); 
  }

  ngOnInit(): void {
    this.authService.handleRedirectObservable().subscribe(
       (val) => {
        if(!this.loginDisplay){
          this.setLoginDisplay();
        }
        this.checkAndSetActiveAccount();
        this.getLoggedInUser();
       }
    );
    
    this.isIframe = window !== window.parent && !window.opener; // Remove this line to use Angular Universal

    this.authService.instance.enableAccountStorageEvents(); // Optional - This will enable ACCOUNT_ADDED and ACCOUNT_REMOVED events emitted when a user logs in or out of another tab or window
    
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) =>
            msg.eventType === EventType.ACCOUNT_ADDED ||
            msg.eventType === EventType.ACCOUNT_REMOVED
        )
      ) 
      .subscribe((result: EventMessage) => {
        if (this.authService.instance.getAllAccounts().length === 0) {
          window.location.pathname = '/';
        } else {
          this.setLoginDisplay();
        }
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.None
        ),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        if(!this.loginDisplay){
          this.setLoginDisplay();
        }
        this.checkAndSetActiveAccount();
        this.getLoggedInUser();
      });

      this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe(result => {
          this.isSmallScreen = result.matches;
        });

      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((ev) => {
        const event: NavigationEnd = ev as NavigationEnd;
        this.currentRoute = (event.url || '');;
        if(this.currentRoute.charAt(0) == '/'){
          this.currentRoute = this.currentRoute.substring(1);
        }
        this.embedRoute = this.embeddableRoutes.find(e => event.url.indexOf(`/${e}`) >= 0);
        if(!this.isEmbedded){
          this.isEmbeddableRoute = !!this.embedRoute;
        }
        this.isHome = this.currentRoute.split('/')[0] == 'home';
      });
  
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  checkAndSetActiveAccount() {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    let activeAccount = this.authService.instance.getActiveAccount();

    if (
      !activeAccount &&
      this.authService.instance.getAllAccounts().length > 0
    ) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  getLoggedInUser(){
    if(!this.profile){
      this.profileOAuthSvc.getProfile().subscribe((profile: ProfileType) => {
        this.profile = profile;
        this.mapRoutes();
      });
    }
  }

  loginRedirect() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({
        ...this.msalGuardConfig.authRequest,
        redirectUri: '/azuread'
      } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  loginPopup() {
    if (this.msalGuardConfig.authRequest) {
      this.authService
        .loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
        .subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);
        });
    } else {
      this.authService
        .loginPopup()
        .subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);
        });
    }
  }

  logout(popup?: boolean) {
    if (popup) {
      this.authService.logoutPopup({
        mainWindowRedirectUri: '/azuread',
      });
    } else {
      this.authService.logoutRedirect();
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
