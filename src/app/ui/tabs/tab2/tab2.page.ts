import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { RouteNavigator } from '../../../shared/routing/route-navigator.service';

@Component({
  selector: 'app-tab2',
  standalone: true,
  imports: [IonRouterOutlet],
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  constructor(private nav: RouteNavigator) {}

  ngOnInit(): void {}
}
