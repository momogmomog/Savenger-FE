import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  input,
  output,
  TemplateRef,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';

register();

export interface SwiperTemplateContext<T> {
  $implicit: T;
  index: number;
}

@Component({
  selector: 'app-ui-swiper',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <swiper-container
      #swiperRef
      [init]="false"
      (swiperslidechange)="onSlideChange()"
    >
      @for (item of items(); track $index) {
        <swiper-slide>
          <ng-container
            *ngTemplateOutlet="
              itemTemplate();
              context: { $implicit: item, index: $index }
            "
          >
          </ng-container>
        </swiper-slide>
      }
      <div class="swiper-pagination"></div>
    </swiper-container>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      swiper-container {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class UiSwiperComponent<T> implements AfterViewInit {
  items = input.required<T[]>();
  itemTemplate = input.required<TemplateRef<SwiperTemplateContext<T>>>();
  enablePagination = input<boolean>(true);

  activeIndex = input<number>(0);
  slidesPerView = input<number | 'auto'>(1);

  swipe = output<{ index: number; item: T }>();

  swiperRef = viewChild.required<ElementRef>('swiperRef');

  private swiperInstance?: Swiper;

  constructor() {
    effect(() => {
      const index = this.activeIndex();
      if (this.swiperInstance && this.swiperInstance.activeIndex !== index) {
        this.swiperInstance.slideTo(index, 300, false);
      }
    });

    effect(() => {
      // Suppress as this is actually required to trigger the effect on item change
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _items = this.items();

      const desiredIndex = untracked(this.activeIndex);

      if (this.swiperInstance) {
        // Swiper needs a tick to process DOM updates from @for
        setTimeout(() => {
          this.swiperInstance?.update();
          if (this.swiperInstance?.activeIndex !== desiredIndex) {
            this.swiperInstance?.slideTo(desiredIndex, 300, false);
          }
        });
      }
    });
  }

  ngAfterViewInit(): void {
    const swiperEl = this.swiperRef().nativeElement;

    Object.assign(swiperEl, {
      initialSlide: this.activeIndex(),
      slidesPerView: this.slidesPerView(),
      pagination: this.enablePagination(),
    });

    swiperEl.initialize();
    this.swiperInstance = swiperEl.swiper;
  }

  onSlideChange(): void {
    if (!this.swiperInstance) return;

    const index = this.swiperInstance.activeIndex;

    const currentItems = this.items();

    if (currentItems && currentItems[index]) {
      this.swipe.emit({ index, item: currentItems[index] });
    }
  }
}
