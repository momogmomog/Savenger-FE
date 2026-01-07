import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  input,
  model,
  output,
  TemplateRef,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';
import { ObjectUtils } from '../util/object-utils';

register();

export interface SwiperTemplateContext<T> {
  $implicit: T;
  index: number;
}

export interface ProgrammaticSwipe {
  timeout: any;
  desiredIndex: number;
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

  activeIndex = model<number>(0);
  slidesPerView = input<number | 'auto'>(1);

  swipe = output<{ index: number; item: T }>();

  swiperRef = viewChild.required<ElementRef>('swiperRef');

  private swiperInstance?: Swiper;

  private activeSwipe: ProgrammaticSwipe | null = null;

  constructor() {
    effect(() => {
      const index = this.activeIndex();

      if (index < 0 || !this.swiperInstance) {
        return;
      }

      if (this.getActiveIndex() !== index) {
        this.scheduleSlide(index);
      }
    });

    effect(() => {
      // Suppress as this is actually required to trigger the effect on item change
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _items = this.items();

      const desiredIndex = untracked(this.activeIndex);

      if (this.swiperInstance) {
        // Schedule with refresh to let the @for in the template populate the items
        // Otherwise swiper instance doesn't pick the new items
        this.scheduleSlide(desiredIndex, true);
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
    if (!this.swiperInstance || !ObjectUtils.isNil(this.activeSwipe)) return;

    const index = this.swiperInstance.activeIndex;
    this.activeIndex.set(index);

    const currentItems = this.items();

    if (currentItems && currentItems[index]) {
      this.swipe.emit({ index, item: currentItems[index] });
    }
  }

  private scheduleSlide(desiredIndex: number, update = false): void {
    const doSlide = (index: number): void => {
      if (this.swiperInstance?.activeIndex !== desiredIndex) {
        this.swiperInstance?.slideTo(index, 0, false);
      }
    };

    const activeSwipe = this.activeSwipe;

    if (ObjectUtils.isNil(activeSwipe)) {
      this.activeSwipe = {
        desiredIndex,
        timeout: setTimeout(() => {
          this.activeSwipe = null;
        }, 30),
      };

      if (!update) {
        doSlide(desiredIndex);
      } else {
        setTimeout(() => {
          this.swiperInstance!.update();
          setTimeout(() => doSlide(desiredIndex));
        });
      }

      return;
    }

    if (activeSwipe.desiredIndex === desiredIndex && !update) {
      return;
    }

    clearInterval(activeSwipe.timeout);
    this.activeSwipe = null;
    this.scheduleSlide(desiredIndex, update);
  }

  private getActiveIndex(): number {
    const activeSwipe = this.activeSwipe;
    if (ObjectUtils.isNil(activeSwipe)) {
      return this.swiperInstance!.activeIndex;
    }

    return activeSwipe.desiredIndex;
  }
}
