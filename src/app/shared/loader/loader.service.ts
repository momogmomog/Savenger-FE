import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoaderOptions } from './loader.options';
import { LoaderEvent } from './loader.event';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  public static instance: LoaderService;

  private preloaderSubject = new BehaviorSubject<LoaderEvent>({
    visible: false,
  });
  loading$ = this.preloaderSubject.asObservable();

  constructor() {
    LoaderService.instance = this;
  }

  show(opts: LoaderOptions): void {
    this.preloaderSubject.next({
      ...opts,
      visible: true,
    });
  }

  hide(opts: LoaderOptions): void {
    this.preloaderSubject.next({
      ...opts,
      visible: false,
    });
  }
}
