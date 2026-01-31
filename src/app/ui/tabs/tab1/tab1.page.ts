import { Component } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonRouterOutlet],
})
export class Tab1Page {
  constructor(private modalService: ModalService) {}
}
