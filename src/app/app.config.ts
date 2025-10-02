import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
  withFetch,
  withXsrfConfiguration,
} from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation,
  LogLevel,
} from '@azure/msal-browser';
import {
  MsalInterceptor,
  MSAL_INSTANCE,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
} from '@azure/msal-angular';
import { environment } from '../environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { provideApi, withBackendApiConfiguration } from './services/api.provider';

function getInteractionType() : InteractionType.Popup | InteractionType.Redirect {
  const parameters = new URLSearchParams(window.location.search);
  console.log('Msal config redirect type', window.location.search);

  let interactionType = InteractionType.Redirect;
  if(parameters){
    const embedMode = parameters.get('embed');
    console.log('Msal config redirect mode', embedMode);
    if(embedMode && embedMode == 'iframe'){
      interactionType = InteractionType.Popup;
      console.log('Msal interact type popup');
    }
  }
  return interactionType;
}

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msalConfig.auth.clientId,
      authority: environment.msalConfig.auth.authority,
      redirectUri: '/azuread',
      postLogoutRedirectUri: '/azuread',
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
      allowPlatformBroker: false, // Disables WAM Broker
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Verbose,
        piiLoggingEnabled: true,
      },
    },
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const interactionType = getInteractionType();
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(
    environment.apiConfig.uri,
    environment.apiConfig.scopes
  );

  protectedResourceMap.set(
    environment.backendConfig.uri,
    environment.backendConfig.scopes
  );

  protectedResourceMap.set(
    environment.powerBIConfig.uri,
    environment.powerBIConfig.scopes
  );

  return {
    interactionType: interactionType,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  const interactionType = getInteractionType();
  return {
    interactionType: interactionType,
    authRequest: {
      scopes: [...environment.msalConfig.scopes],
    },
    loginFailedRoute: '/login-failed',
  };
}

export const LOCATION_OBJECT = 'LOCATION_OBJECT';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule,
      MatButtonModule,
      MatToolbarModule,
      MatListModule,
      MatMenuModule,
      MatSnackBarModule
    ),
    provideNoopAnimations(),
    provideApi(
      withBackendApiConfiguration({
          basePath: environment.backendConfig.uri,
      }),
    ),
    provideHttpClient(
      withInterceptorsFromDi(), 
      withFetch()
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService, provideAnimationsAsync(), 
    Location, 
    {provide: LocationStrategy, useClass: PathLocationStrategy}
  ],
};
