import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  public static instance: LoaderService;

  private preloaderSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.preloaderSubject.asObservable();

  constructor() {
    LoaderService.instance = this;
  }

  show(): void {
    this.preloaderSubject.next(true);
  }

  hide(): void {
    this.preloaderSubject.next(false);
  }
}
