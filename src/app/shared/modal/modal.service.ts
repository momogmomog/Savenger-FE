import { inject, Injectable, signal, Type } from '@angular/core';
import {
  ModalController,
  ModalOptions,
  ToastController,
} from '@ionic/angular/standalone';
import { ModalContentBaseComponent } from './modals/modal-content-base.component';
import { StringUtils } from '../util/string-utils';
import {
  SHELL_COMPONENT_MAP,
  ShellConfig,
  ShellType,
} from './shells/modal-shell.types';
import { ModalDismissType } from './modal-dismiss.type';

export type CustomModalOptions = Omit<
  ModalOptions,
  'component' | 'componentProps'
>;

export class ModalResponse<TResult> {
  constructor(
    public readonly result: TResult,
    public readonly dismissType: ModalDismissType,
  ) {}

  public isConfirmed(): boolean {
    return this.dismissType === ModalDismissType.USER_CONFIRM;
  }

  public ifConfirmed(callback: (data: TResult) => void): void {
    if (this.isConfirmed()) {
      callback(this.result);
    }
  }
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);

  async open<TPayload, TResult>(
    component: Type<ModalContentBaseComponent<TPayload, TResult>>,
    payload: TPayload,
    shellConfig: ShellConfig = { shellType: ShellType.BLANK },
    options: CustomModalOptions = {},
  ): Promise<HTMLIonModalElement> {
    const modalId = options.id || StringUtils.getUniqueStr();

    // Resolve the Shell Component based on the Enum
    const ShellComponentClass = SHELL_COMPONENT_MAP[shellConfig.shellType];

    if (!ShellComponentClass) {
      throw new Error(
        `No shell implementation found for type: ${shellConfig.shellType}`,
      );
    }

    // setting null! but the shell will never see it as null since the modal value is set before shell is initialized
    const modalProxy = signal<HTMLIonModalElement>(null!);

    const modal = await this.modalCtrl.create({
      ...options,
      id: modalId,
      component: ShellComponentClass,
      componentProps: {
        component: component,
        componentPayload: payload,
        shellConfig: shellConfig,
        modalId: modalId,
        modalProxy: modalProxy,
      },
    });

    modalProxy.set(modal);
    await modal.present();

    // const { data } = await modal.onDidDismiss<TResult>();
    // return data;
    return modal;
  }

  async openAndWait<TPayload, TResult>(
    component: Type<ModalContentBaseComponent<TPayload, TResult>>,
    payload: TPayload,
    shellConfig: ShellConfig = { shellType: ShellType.BLANK },
    options: CustomModalOptions = {},
  ): Promise<ModalResponse<TResult>> {
    const modal = await this.open(component, payload, shellConfig, options);

    const resp = await modal.onDidDismiss<TResult>();
    return new ModalResponse<TResult>(
      resp.data!,
      resp.role as ModalDismissType,
    );
  }

  public async closeAllModals(): Promise<void> {
    while (true) {
      const topModal = await this.modalCtrl.getTop();
      if (!topModal) {
        return;
      }

      await topModal.dismiss(undefined, 'force-close');
    }
  }

  public async showSuccess(msg: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }

  public async showDangerToast(msg: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: 'danger',
    });
    await toast.present();
  }
}
