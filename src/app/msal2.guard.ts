import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, GuardResult, MaybeAsync, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuard, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { Observable, catchError, from, of, switchMap } from 'rxjs';
import { Location} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class Msal2Guard extends MsalGuard {
  msalService: MsalService ;
  msalConfig: MsalGuardConfiguration;

  constructor(
    @Inject(MSAL_GUARD_CONFIG) msalGuardConfig: MsalGuardConfiguration,
    msalBroadcastService: MsalBroadcastService,
    authService: MsalService,
    location: Location,
    router: Router
  ) {
    super(msalGuardConfig, msalBroadcastService, authService, location as any, router);
    this.msalService = authService;
    this.msalConfig = msalGuardConfig;
  }

  override canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {
      console.log('msal2 attempt ssosilent');
      return from(this.msalService.instance.ssoSilent({
        // Optionally, you can specify scopes here.
        scopes: (this.msalConfig?.authRequest as any)?.scopes || ['openid email profile']
      })).pipe(
        switchMap((result: AuthenticationResult) => {
          // If silent sign-in succeeds, return true.
          console.log('msal2 success ssosilent');
          return of(true);
        }),
        catchError((error: any) => {
          console.log('Custom msal failed', error);
          return super.canActivate(route, state);
        }
        )
      );
  }
  override canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {
      console.log('msal2 attempt ssosilent child');
      return from(this.msalService.instance.ssoSilent({
        // Optionally, you can specify scopes here.
        scopes: (this.msalConfig?.authRequest as any)?.scopes || ['openid email profile']
      })).pipe(
        switchMap((result: AuthenticationResult) => {
          // If silent sign-in succeeds, return true.
          console.log('msal2 success ssosilent child');
          return of(true);
        }),
        catchError((error: any) => {
          console.log('Custom msal child failed', error);
          return super.canActivateChild(childRoute, state);
        }
        )
      );
  }
  override canMatch(): Observable<boolean | UrlTree> {
      return super.canMatch();
  }
}
