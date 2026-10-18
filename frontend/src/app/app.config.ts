import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth.interceptor';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { APP_INITIALIZER } from '@angular/core';
import { AuthService } from './core/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
    provide: APP_INITIALIZER,
    multi: true,
    deps: [AuthService],
    useFactory: (auth: AuthService) =>
      () => auth.initialize()
  },
  ],
};
