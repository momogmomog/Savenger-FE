import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { STORAGE_AUTH_TOKEN_NAME } from '../../shared/general.constants';

@Injectable({ providedIn: 'any' })
export class AccessTokenStorage {
  private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null);

  constructor() {}

  public setToken(token: string | null): void {
    if (!token) {
      return;
    }
    //TODO: Back end returns the token as a secure cookie and se only store a logged in flag in local storage.
    localStorage.setItem(STORAGE_AUTH_TOKEN_NAME, token);
    // this.tokenSubject.next(`${token}`);
  }

  public getToken(): Observable<string> {
    return new Observable<string>((subscriber) =>
      subscriber.next(localStorage.getItem(STORAGE_AUTH_TOKEN_NAME) || ''),
    );
    // return this.tokenSubject.pipe(
    //   filter((token: string | null) => {
    //     const loggedIn = ObjectUtils.parseBoolean(
    //       localStorage.getItem(STORAGE_LOGGED_IN_FLAG_NAME),
    //     );
    //
    //     // // If the user is logged in and there is no header, then wait until the refresh token completes.
    //     // if (loggedIn && token === null) {
    //     //   return false;
    //     // }
    //
    //     return true;
    //   }),
    //   first(),
    //   map((value) => value + ''),
    // );
  }
}
