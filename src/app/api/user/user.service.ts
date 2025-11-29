import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from './user';
import { UserRepository } from './user.repository';

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

  public clearUser(): void {
    this.currentUser.next(undefined);
  }
}
