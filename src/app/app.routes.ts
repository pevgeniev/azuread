import { Route } from '@angular/router';
import { FailedComponent } from './pages/failed/failed.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MsalGuard } from '@azure/msal-angular';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AdminPageComponent } from './pages/admin-page/admin.page.component';
import { PowerUserPageComponent } from './pages/power-user-page/power-user.page.component';
import { MSGroupGuard } from './auth/msgroup.guard';
import { environment } from 'src/environments/environment';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { PowerBIReportComponent } from './pages/power-bi-report/power-bi-report.component';

export class Permission{
  static ADMIN = environment.groups.admin; // 'ee4fc09d-ae1f-4e87-9036-8a6efd95c71b', //admin group
  static USER = environment.groups.user; // '76206681-b03d-4b4c-8d53-dcb799badcdb',//user group
}

export interface NavRoute extends Partial<Route> {
  name?: string;
  icon?: string;
  order?: number;
  permissions?: Array<string>;
  hidden?: boolean;
  img?: string;
}
export const routes: NavRoute[] = [
  {
    path: 'profile',
    title: 'Profile',
    icon: 'person',
    order: 10,
    component: ProfileComponent,
    canActivate: [MsalGuard],
    hidden: true
  },
  {
    path: 'home',
    title: 'Home',
    icon: 'home',
    order: 0,
    component: HomeComponent,
    canActivate: [MsalGuard],
  }, 
  {
    path: 'echo/admin',
    title: 'Echo admin',
    icon: 'support_agent',
    order: 1,
    component: AdminPageComponent,
    canActivate: [MsalGuard,MSGroupGuard],
    permissions: [],
    hidden: true
  },
  {
    path: 'echo/user',
    title: 'Echo user',
    icon: 'person',
    order: 1,
    component: PowerUserPageComponent,
    canActivate: [MsalGuard, MSGroupGuard],
    permissions: [],
    hidden: true
  },
  {
    path: 'bianalysis',
    title: 'BI Analysis',
    order: 20,
    component: PowerBIReportComponent,
    canActivate: [MsalGuard,MSGroupGuard],
    permissions: [],
    data: {
      report: "https://app.powerbi.com/reportEmbed?reportId=481a5437-be48-4d1b-90e9-b8c8d4fca0c3&autoAuth=true&ctid=3d461195-f3e9-4dd6-b2e8-ea8457c20fc8",
    },
    hidden: true,
  },
  {
    path: 'bifinance',
    title: 'BI Finance',
    order: 20,
    component: PowerBIReportComponent,
    canActivate: [MsalGuard,MSGroupGuard],
    permissions: [],
    data: {
      report: "https://app.powerbi.com/reportEmbed?reportId=e2b6edd4-19fb-4bd7-b9a1-083c7bebe69e&autoAuth=true&ctid=3d461195-f3e9-4dd6-b2e8-ea8457c20fc8",
    },
    hidden: true,
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
    canActivate: [MsalGuard],
    hidden: true
  },
  {
    path: 'login-failed',
    component: FailedComponent,
    hidden: true
  },
  { path: '',   redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
