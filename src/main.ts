import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
  TitleStrategy,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from './app/api/auth/auth.interceptor';
import { BasicTitleStrategy } from './app/shared/routing/title-strategy.service';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideCharts(withDefaultRegisterables()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    { provide: TitleStrategy, useClass: BasicTitleStrategy },
  ],
});
