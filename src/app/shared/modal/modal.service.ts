import { inject, Injectable, Type } from '@angular/core';
import { ModalController, ModalOptions } from '@ionic/angular/standalone';
import { ModalContentBaseComponent } from './modals/modal-content-base.component';
import { StringUtils } from '../util/string-utils';
import {
  ShellConfig,
  ShellType,
  SHELL_COMPONENT_MAP,
} from './modals/shells/modal-shell.types';

export type CustomModalOptions = Omit<
  ModalOptions,
  'component' | 'componentProps'
>;

@Injectable({ providedIn: 'root' })
export class IonicModalService {
  private modalCtrl = inject(ModalController);

  async open<TPayload, TResult>(
    component: Type<ModalContentBaseComponent<TPayload, TResult>>,
    payload: TPayload,
    shellConfig: ShellConfig = { shellType: ShellType.BLANK },
    options: CustomModalOptions = {},
  ): Promise<TResult | undefined> {
    const modalId = options.id || StringUtils.getUniqueStr();

    // Resolve the Shell Component based on the Enum
    const ShellComponentClass = SHELL_COMPONENT_MAP[shellConfig.shellType];

    if (!ShellComponentClass) {
      throw new Error(
        `No shell implementation found for type: ${shellConfig.shellType}`,
      );
    }

    const modal = await this.modalCtrl.create({
      ...options,
      id: modalId,
      component: ShellComponentClass,
      componentProps: {
        component: component,
        componentPayload: payload,
        shellConfig: shellConfig,
        modalId: modalId,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss<TResult>();
    return data;
  }
}
