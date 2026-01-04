import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Budget } from '../../../api/budget/budget'; // Adjust path
import { addIcons } from 'ionicons';
import { arrowForwardOutline, walletOutline } from 'ionicons/icons';

@Component({
  selector: 'app-budget-slider-item',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
  ],
  templateUrl: './budget-slider-item.component.html',
  styleUrls: ['./budget-slider-item.component.scss'],
})
export class BudgetSliderItemComponent {
  budget = input.required<Budget>();
  detailsClicked = output<void>();

  constructor() {
    addIcons({ arrowForwardOutline, walletOutline });
  }

  onDetailsClick(ev: Event): void {
    ev.stopPropagation();
    this.detailsClicked.emit();
  }
}
