import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthenticationService } from './api/auth/authentication.service';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { UserService } from './api/user/user.service';
import { AppRoutingPath } from './app-routing.path';
import { filter } from 'rxjs';
import { User } from './api/user/user';

// register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  private userService = inject(UserService);

  showNavbar = true;
  user?: User;

  constructor() {}

  async ngOnInit(): Promise<void> {
    await this.authService.init();
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart || event instanceof NavigationEnd,
        ),
      )
      .subscribe((event: NavigationStart | NavigationEnd) => {
        this.showNavbar = event.url !== AppRoutingPath.LOGIN.toString();
      });

    this.userService.currentUser$.subscribe((usr) => (this.user = usr));
    // this.userService.fetchUser();
  }
}
