import { Directive, OnDestroy } from '@angular/core';

interface Unsubscribable {
  unsubscribe(): void;
}

@Directive()
export abstract class AutoUnsubComponent implements OnDestroy {
  private subscriptions: Unsubscribable[] = [];

  // "sink setter"
  public set sub(subscription: Unsubscribable) {
    this.subscriptions.push(subscription);
  }

  protected addSub(subscription: Unsubscribable): void {
    this.sub = subscription;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    console.log('Automatically unsubscribed');
  }
}
