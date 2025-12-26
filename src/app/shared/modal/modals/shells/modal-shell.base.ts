import {
  Component,
  inject,
  Input,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { ModalContentBaseComponent } from '../modal-content-base.component';

@Component({ template: '<ng-template #container></ng-template>' })
export class ModalShellBase implements OnInit {
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  @Input() component!: Type<ModalContentBaseComponent<any, any>>;
  @Input() modalId!: string;

  @Input() componentPayload: any;

  // This receives the specific config (e.g. { type: 'HEADER', title: 'My Title' })
  // Child components can cast to their corresponding configs
  @Input() shellConfig: any;

  protected modalCtrl = inject(ModalController);

  ngOnInit(): void {
    this.loadComponent();
  }

  private loadComponent(): void {
    this.container.clear();
    const ref = this.container.createComponent(this.component);

    // Pass data to the inner content
    ref.setInput('payload', this.componentPayload);
    ref.setInput('modalId', this.modalId);
    ref.setInput('shellConfig', this.shellConfig);
  }
}
