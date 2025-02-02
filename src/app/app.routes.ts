import { Route } from '@angular/router';
import { FailedComponent } from './failed/failed.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { MsalGuard } from '@azure/msal-angular';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export interface NavRoute extends Partial<Route> {
  name?: string;
  icon?: string;
  order?: number;
}
export const routes: NavRoute[] = [
  {
    path: 'profile',
    title: 'Profile',
    icon: 'person',
    order: 10,
    component: ProfileComponent,
    canActivate: [MsalGuard],
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
    path: 'login-failed',
    component: FailedComponent,
  },
  {
    path: 'fileupload',
    component: FileUploadComponent,
    canActivate: [MsalGuard],
  },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
