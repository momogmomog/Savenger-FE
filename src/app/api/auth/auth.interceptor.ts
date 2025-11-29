import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { RouteNavigator } from '../../shared/routing/route-navigator.service';
import { EMPTY, throwError } from 'rxjs';
// import { EMPTY, switchMap, throwError } from 'rxjs';
import { STORAGE_LOGGED_IN_FLAG_NAME } from '../../shared/general.constants';
import { AppRoutingPath } from '../../app-routing.path';
import { HttpStatus } from '../../shared/http/http-status';
import { LoaderService } from '../../shared/loader/loader.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const nav = inject(RouteNavigator);
  // const authService = inject(AuthenticationService);
  const loaderService = inject(LoaderService);

  const goToLogin = (): void => {
    localStorage.setItem(STORAGE_LOGGED_IN_FLAG_NAME, false + '');
    nav.navigate(AppRoutingPath.LOGIN);
    loaderService.hide({});
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== HttpStatus.UNAUTHORIZED) {
        return throwError(() => error);
      }

      goToLogin();
      return EMPTY;
      // const userLoggedIn = ObjectUtils.parseBoolean(
      //   localStorage.getItem(STORAGE_LOGGED_IN_FLAG_NAME),
      // );
      // if (!userLoggedIn) {
      //   goToLogin();
      //   return EMPTY;
      // }
      //
      // return authService.refresh().pipe(
      //   catchError(() => {
      //     goToLogin();
      //     return EMPTY;
      //   }),
      //   switchMap((response: AuthTokenDto) => {
      //     const modifiedReq = req.clone({
      //       headers: req.headers.set(
      //         HEADER_AUTH_TOKEN_NAME,
      //         `Bearer ${response.accessToken}`,
      //       ),
      //     });
      //
      //     return next(modifiedReq).pipe(
      //       catchError((err) => {
      //         if (err.status === HttpStatus.UNAUTHORIZED) {
      //           goToLogin();
      //           return EMPTY;
      //         }
      //
      //         return throwError(() => err);
      //       }),
      //     );
      //   }),
      // );
    }),
  );
};
