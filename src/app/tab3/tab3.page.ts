import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { UserService } from '../api/user/user.service';
import { User } from '../api/user/user';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
  ],
})
export class Tab3Page implements OnInit {
  currentUser!: User;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user!;
    });
  }
}
