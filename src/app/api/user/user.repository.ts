import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../shared/http/http-client-secured.service';
import { Observable } from 'rxjs';
import { OtherUser, User } from './user';
import { Endpoints } from '../../shared/http/endpoints';
import { RouteUtils } from '../../shared/routing/route-utils';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  constructor(private http: HttpClientSecuredService) {}

  public getUser(): Observable<User> {
    return this.http.get<User>(Endpoints.USER_DETAILS);
  }

  public getOtherUser(username: string): Observable<OtherUser> {
    return this.http.get<OtherUser>(
      RouteUtils.setPathParams(Endpoints.OTHER_USER_DETAILS, { username }),
    );
  }
}
