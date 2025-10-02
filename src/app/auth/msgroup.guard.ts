// group.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NavRoute } from '../app.routes';

@Injectable({
  providedIn: 'root',
})
export class MSGroupGuard implements CanActivate {
  constructor(private authService: MsalService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const account = this.authService.instance.getActiveAccount();

    if (!account) {
      this.router.navigate(['/home']);
      return false;
    }

    const requiredGroups: string[] = (next.routeConfig as NavRoute)?.permissions || [];

    const idTokenClaims = account.idTokenClaims as any;
    const userGroups: string[] = idTokenClaims?.groups || [];

    let hasAccess = requiredGroups.length == 0 || requiredGroups.some((groupId) =>
      userGroups.includes(groupId)
    );
    
    if (!hasAccess) {
      this.router.navigate(['/access-denied']);
    }

    return hasAccess;
  }
}
