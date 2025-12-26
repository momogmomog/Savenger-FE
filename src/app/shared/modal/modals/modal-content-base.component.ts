import { Component, inject, input } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

@Component({ template: '' })
export abstract class ModalContentBaseComponent<TData, TResult> {
  protected modalController = inject(ModalController);

  public payload = input.required<TData>();
  public modalId = input.required<string>();

  async close(data?: TResult, role = 'confirm'): Promise<void> {
    await this.modalController.dismiss(data, role, this.modalId());
  }

  async dismiss(): Promise<void> {
    await this.modalController.dismiss(null, 'cancel', this.modalId());
  }
}
