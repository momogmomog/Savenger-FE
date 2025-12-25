import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef, // Import this
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';

register();

// 1. Define the Context Interface
// This tells Angular: "Every slide template will have access to an item ($implicit) and an index."
export interface SwiperTemplateContext<T> {
  $implicit: T; // The default item (accessed via let-item)
  index: number; // The index (accessed via let-i="index")
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
      @for (item of items; track $index) {
        <swiper-slide>
          <ng-container
            *ngTemplateOutlet="
              itemTemplate;
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
  @Input({ required: true }) items: T[] = [];

  // 2. USE THE INTERFACE HERE
  // Instead of <any>, we use SwiperTemplateContext<T>
  @Input({ required: true }) itemTemplate!: TemplateRef<
    SwiperTemplateContext<T>
  >;

  @Input() initialSlide = 0;
  @Input() slidesPerView = 1;

  @Output() swipe = new EventEmitter<{ index: number; item: T }>();

  @ViewChild('swiperRef') swiperRef!: ElementRef;

  private swiperInstance!: Swiper;

  ngAfterViewInit(): void {
    const swiperEl = this.swiperRef.nativeElement;
    Object.assign(swiperEl, {
      initialSlide: this.initialSlide,
      slidesPerView: this.slidesPerView,
      pagination: '.swiper-pagination',
    });
    swiperEl.initialize({});

    this.swiperInstance = swiperEl.swiper;
  }

  onSlideChange(): void {
    const index = this.swiperInstance.activeIndex;

    if (this.items && this.items[index]) {
      this.swipe.emit({ index, item: this.items[index] });
    }
  }
}
