import { Component } from '@angular/core';
import { ModalShellBase } from './modal-shell.base';
import { ShellConfigHeader } from './modal-shell.types';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';

@Component({
  template: ` <ion-header>
      <ion-toolbar>
        <ion-title>{{ config.title }}</ion-title>

        <ion-buttons slot="end" *ngIf="config.showCloseButton !== false">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ng-template #container></ng-template>
    </ion-content>`,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    NgIf,
    IonButton,
    IonIcon,
  ],
})
export class ModalShellHeader extends ModalShellBase {
  get config(): ShellConfigHeader {
    return this.shellConfig as ShellConfigHeader;
  }

  async dismiss(): Promise<void> {
    await this.modalCtrl.dismiss(null, 'cancel', this.modalId);
  }
}
