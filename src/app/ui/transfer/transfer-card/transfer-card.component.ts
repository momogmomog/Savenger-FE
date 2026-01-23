import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForward,
  informationCircleOutline,
  removeCircleOutline,
  swapHorizontalOutline,
} from 'ionicons/icons';
import { Transfer } from '../../../api/transfer/transfer';

@Component({
  selector: 'app-transfer-card',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, IonIcon, IonButton],
  template: `
    <ion-card class="transfer-card">
      <ion-card-content class="ion-no-padding">
        <div class="card-header ion-padding-horizontal ion-padding-top">
          <div class="name-container">
            <h2 class="budget-name text-truncate">
              {{ transfer().receiverBudget.budgetName }}
            </h2>
          </div>

          <ion-button
            fill="clear"
            size="small"
            color="medium"
            (click)="onViewDetails($event)"
          >
            <ion-icon
              slot="icon-only"
              name="information-circle-outline"
            ></ion-icon>
          </ion-button>
        </div>

        <div class="action-row ion-padding">
          <ion-button
            color="danger"
            fill="outline"
            class="action-btn small-btn"
            (click)="onArchive($event)"
          >
            <ion-icon slot="icon-only" name="remove-circle-outline"></ion-icon>
          </ion-button>
          <ion-button
            color="primary"
            expand="block"
            class="action-btn main-btn"
            (click)="onTransfer($event)"
          >
            <ion-icon slot="start" name="swap-horizontal-outline"></ion-icon>
            Send Funds
          </ion-button>
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      .transfer-card {
        background: var(--ion-card-background, #1e1e1e);
        border-radius: 16px;
        margin-bottom: 16px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 4px;
      }

      .name-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
        overflow: hidden;
      }

      .budget-name {
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0;
        color: var(--ion-text-color, #fff);
      }

      .card-body {
        padding-bottom: 12px;
      }

      .action-row {
        display: flex;
        gap: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        padding-top: 12px;
      }

      .action-btn {
        margin: 0;
        --border-radius: 8px;
      }

      .small-btn {
        width: 48px;
        flex-shrink: 0;
      }

      .main-btn {
        flex-grow: 1;
        --box-shadow: none;
      }
    `,
  ],
})
export class TransferCardComponent {
  transfer = input.required<Transfer>();

  viewDetails = output<Transfer>();
  archive = output<Transfer>();
  performTransfer = output<Transfer>();

  constructor() {
    addIcons({
      informationCircleOutline,
      removeCircleOutline,
      swapHorizontalOutline,
      arrowForward,
    });
  }

  onViewDetails(e: Event): void {
    e.stopPropagation();
    this.viewDetails.emit(this.transfer());
  }

  onArchive(e: Event): void {
    e.stopPropagation();
    this.archive.emit(this.transfer());
  }

  onTransfer(e: Event): void {
    e.stopPropagation();
    this.performTransfer.emit(this.transfer());
  }
}
