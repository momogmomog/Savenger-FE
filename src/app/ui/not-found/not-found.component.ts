import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {}

export const NOT_FOUND_ROUTES: Routes = [
  {
    path: '',
    component: NotFoundComponent,
  },
];
