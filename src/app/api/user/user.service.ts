import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OtherUser, User } from './user';
import { UserRepository } from './user.repository';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../shared/util/field-error-wrapper';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly currentUser: BehaviorSubject<User | undefined> =
    new BehaviorSubject<User | undefined>(undefined);
  public readonly currentUser$ = this.currentUser.asObservable();

  constructor(private userRepository: UserRepository) {}

  public fetchUser(): void {
    this.userRepository
      .getUser()
      .subscribe((value) => this.currentUser.next(value));
  }

  public async fetchOtherUser(
    username: string,
  ): Promise<WrappedResponse<OtherUser>> {
    return await new FieldErrorWrapper(() =>
      this.userRepository.getOtherUser(username),
    ).execute();
  }

  public clearUser(): void {
    this.currentUser.next(undefined);
  }
}
