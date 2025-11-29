import { Injectable } from '@angular/core';
import { HttpClientService } from '../../shared/http/http-client.service';
import { LoginDto } from './dto/login.dto';
import { Observable } from 'rxjs';
import { AuthTokenDto } from './dto/auth-token.dto';
import { Endpoints } from '../../shared/http/endpoints';

@Injectable({ providedIn: 'root' })
export class AuthenticationRepository {
  constructor(private http: HttpClientService) {}

  public login(loginDto: LoginDto): Observable<AuthTokenDto> {
    return this.http.post<null, AuthTokenDto>(Endpoints.LOGIN, null, {
      withCredentials: true,
      headers: {
        Authorization:
          'Basic ' + btoa(`${loginDto.username}:${loginDto.password}`),
      },
    });
  }
}
