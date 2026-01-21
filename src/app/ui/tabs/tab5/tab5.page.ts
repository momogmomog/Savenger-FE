import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { UserService } from '../../../api/user/user.service';
import { User } from '../../../api/user/user';
import { STORAGE_LOGGED_IN_FLAG_NAME } from '../../../shared/general.constants';
import { AppRoutingPath } from '../../../app-routing.path';
import { RouteNavigator } from '../../../shared/routing/route-navigator.service';

@Component({
  selector: 'app-tab5',
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton],
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit {
  currentUser?: User;

  constructor(
    private userService: UserService,
    private nav: RouteNavigator,
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user!;
    });
  }

  protected logout(): void {
    localStorage.setItem(STORAGE_LOGGED_IN_FLAG_NAME, false + '');
    this.nav.navigate(AppRoutingPath.LOGIN);
  }
}
