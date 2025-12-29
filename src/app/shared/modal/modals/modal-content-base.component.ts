import { Component, effect, inject, input } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { ModalDismissType } from '../modal-dismiss.type';
import { ObjectUtils } from '../../util/object-utils';

@Component({ template: '' })
export abstract class ModalContentBaseComponent<TData, TResult> {
  protected modalController = inject(ModalController);

  protected payload = input.required<TData>();
  protected modalId = input.required<string>();
  protected modalInstanceSignal = input.required<HTMLIonModalElement>();
  private dismissalData: TResult | null = null;

  // Depends on what shell was used when creating the modal
  public shellConfig = input.required<any>();

  constructor() {
    effect(() => {
      const modal = this.modalInstanceSignal();
      this.setupDismissalInterceptor(modal);
    });
  }

  async close(data?: TResult): Promise<void> {
    await this.modalController.dismiss(
      data,
      ModalDismissType.USER_CONFIRM,
      this.modalId(),
    );
  }

  async dismiss(data?: TResult): Promise<void> {
    await this.modalController.dismiss(
      data,
      ModalDismissType.USER_DISMISS,
      this.modalId(),
    );
  }

  /**
   * Sets the data that should be returned when the modal closes,
   * regardless of HOW it closes (Back button, Swipe, User initiated or Close Button).
   */
  protected setDismissalData(data: TResult | null): void {
    this.dismissalData = data;
  }

  protected async canDismiss(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: TResult | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    role: ModalDismissType,
  ): Promise<boolean> {
    return true;
  }

  private setupDismissalInterceptor(modalEl: HTMLIonModalElement): void {
    modalEl.canDismiss = async (
      data?: any,
      role?: string,
    ): Promise<boolean> => {
      if (
        [ModalDismissType.USER_DISMISS, ModalDismissType.USER_CONFIRM].includes(
          role as ModalDismissType,
        ) &&
        ObjectUtils.isNil(data) &&
        !ObjectUtils.isNil(this.dismissalData)
      ) {
        void modalEl.dismiss(this.dismissalData, role);
        return false;
      }

      if (!Object.keys(ModalDismissType).includes(role!)) {
        void modalEl.dismiss(
          this.dismissalData,
          ModalDismissType.OTHER_DISMISS,
        );
        return false;
      }

      return await this.canDismiss(data, role as ModalDismissType);
    };
  }
}
