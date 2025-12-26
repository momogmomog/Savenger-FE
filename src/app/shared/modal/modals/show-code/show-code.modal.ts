import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonButton, IonFooter, IonToolbar } from '@ionic/angular/standalone';
import { ModalContentBaseComponent } from '../modal-content-base.component';

export interface ShowCodePayload {
  code: string;
  language?: string;
}

/**
 * Example dummy modal for testing purpose.
 * Who knows, might find use case in the future!
 */
@Component({
  standalone: true,
  imports: [IonButton, IonFooter, IonToolbar, NgIf], // Ionic standalone imports
  template: `
    <div class="p-4">
      <pre><code>{{ payload().code }}</code></pre>
      <p *ngIf="payload().language">Language: {{ payload().language }}</p>
    </div>

    <ion-footer>
      <ion-toolbar>
        <ion-button slot="end" (click)="confirmCopy()">Copy & Close</ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class ShowCodeModal
  extends ModalContentBaseComponent<ShowCodePayload, boolean>
  implements OnInit
{
  ngOnInit(): void {
    console.log('Viewing code for:', this.payload().language);
  }

  confirmCopy(): void {
    void navigator.clipboard.writeText(this.payload().code);
    void this.close(true);
  }
}
