import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-choose-option-alert',
  standalone: true,
  imports: [],
  templateUrl: './choose-option-alert.component.html',
  styleUrl: './choose-option-alert.component.scss',
})
export class ChooseOptionAlertComponent {}

export const CHOOSE_OPTION_ALERT_ROUTES: Routes = [
  {
    path: '',
    component: ChooseOptionAlertComponent,
  },
];
