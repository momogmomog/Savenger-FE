import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { HttpHeader } from './http-header';
import { HttpClient } from '@angular/common/http';
import { combineLatest, Observable } from 'rxjs';
import { HEADER_AUTH_TOKEN_NAME } from '../general.constants';
import { map } from 'rxjs/operators';
import { AccessTokenStorage } from '../../api/auth/access-token-storage';

@Injectable({ providedIn: 'root' })
export class HttpClientSecuredService extends HttpClientService {
  constructor(
    httpClient: HttpClient,
    private accessTokenStorage: AccessTokenStorage,
  ) {
    super(httpClient);
  }

  protected override getHeaders(): Observable<HttpHeader> {
    const headers$: Observable<HttpHeader> = super.getHeaders();
    const token$: Observable<string> = this.accessTokenStorage.getToken();

    return combineLatest([headers$, token$]).pipe(
      map(([headers, authToken]) => {
        if (authToken) {
          headers[HEADER_AUTH_TOKEN_NAME] = authToken;
        }
        return headers;
      }),
    );
  }
}
