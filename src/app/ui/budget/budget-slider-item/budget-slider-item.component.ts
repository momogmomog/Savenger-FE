import { Component, input, OnInit } from '@angular/core';
import { Budget } from '../../../api/budget/budget';
import { IonButton, IonCol, IonGrid, IonRow } from '@ionic/angular/standalone';

@Component({
  selector: 'app-budget-slider-item',
  templateUrl: './budget-slider-item.component.html',
  styleUrls: ['./budget-slider-item.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonButton],
})
export class BudgetSliderItemComponent implements OnInit {
  budget = input<Budget>(null!);

  constructor() {}

  ngOnInit(): void {}
}
