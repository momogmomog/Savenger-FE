import { Subscription } from 'rxjs';
import { Directive, OnDestroy } from '@angular/core';

@Directive()
export abstract class AutoUnsubComponent implements OnDestroy {
  // "sink setter"
  public set sub(subscription: Subscription) {
    this.subscriptions.push(subscription);
  }

  protected addSub(subscription: Subscription): void {
    this.sub = subscription;
  }

  private subscriptions: Subscription[] = [];

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    console.log('Automatically unsubscribed');
  }
}
