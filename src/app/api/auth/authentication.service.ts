import { Injectable } from '@angular/core';
import { LoginDto } from './dto/login.dto';
import { AuthTokenDto } from './dto/auth-token.dto';
import { AuthenticationRepository } from './authentication.repository';
import { UserService } from '../user/user.service';
import { AccessTokenStorage } from './access-token-storage';
import { STORAGE_LOGGED_IN_FLAG_NAME } from '../../shared/general.constants';
import { ObjectUtils } from '../../shared/util/object-utils';
import { RouteNavigator } from '../../shared/routing/route-navigator.service';
import { LoaderService } from '../../shared/loader/loader.service';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../shared/util/field-error-wrapper';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  constructor(
    private repository: AuthenticationRepository,
    private userService: UserService,
    private accessTokenStorage: AccessTokenStorage,
    private nav: RouteNavigator,
    private loaderService: LoaderService,
  ) {}

  public async login(
    loginDto: LoginDto,
  ): Promise<WrappedResponse<AuthTokenDto>> {
    const res = await new FieldErrorWrapper(() =>
      this.repository.login(loginDto),
    ).execute();

    if (res.isSuccess) {
      localStorage.setItem(STORAGE_LOGGED_IN_FLAG_NAME, true + '');
      this.accessTokenStorage.setToken(res.response.authToken);
      this.userService.fetchUser();
    }

    return res;
  }

  public async init(): Promise<void> {
    if (typeof window === 'undefined') {
      // console.log('Not initializing auth service on the server side.');
      return;
    }

    const loggedIn = ObjectUtils.parseBoolean(
      localStorage.getItem(STORAGE_LOGGED_IN_FLAG_NAME),
    );

    if (!loggedIn) {
      return;
    }

    this.accessTokenStorage.getToken().subscribe(() => {
      this.userService.fetchUser();
    });
  }
}
