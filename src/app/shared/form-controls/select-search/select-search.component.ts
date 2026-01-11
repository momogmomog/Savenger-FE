import {
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  InfiniteScrollCustomEvent,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, chevronDown, close, search } from 'ionicons/icons';
import { EmptyPage, Page } from '../../util/page'; // Your existing Page util
import { SelectSearchItem } from './select-search.item';
import { AutoUnsubComponent } from '../../util/auto-unsub.component'; // Your existing Item interface

@Component({
  selector: 'app-select-search',
  standalone: true,
  templateUrl: './select-search.component.html',
  styleUrls: ['./select-search.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonItem,
    IonLabel,
    IonIcon,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonSearchbar,
    IonList,
    IonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectSearchComponent),
      multi: true,
    },
  ],
})
export class SelectSearchComponent
  extends AutoUnsubComponent
  implements ControlValueAccessor
{
  label = input<string>('Select Item');
  placeholder = input<string>('Tap to select...');
  searchPlaceholder = input<string>('Search...');
  disabled = model<boolean>(false);
  clearOnSelect = input<boolean>(false);
  payload = model<Page<SelectSearchItem<any>>>(new EmptyPage());
  searchTerm = model('');

  selectionChange = output<SelectSearchItem<any> | null>();
  onTouch = output<void>();
  loadMore = output<number>();

  items = computed(() => this.payload().content || []);
  hasNextPage = computed(() => {
    const p = this.payload();
    return p.page.totalPages > 1 && p.page.number + 1 < p.page.totalPages;
  });

  selectedItem = signal<SelectSearchItem<any> | null>(null);
  isModalOpen = signal(false);

  @ViewChild(IonModal) modal!: IonModal;

  constructor() {
    super();
    addIcons({ chevronDown, search, close, checkmark });
  }

  openModal(): void {
    if (this.disabled()) return;
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.onTouch.emit();
  }

  onSearchChange(event: any): void {
    const query = event.detail.value;
    this.searchTerm.set(query);
  }

  onItemSelect(item: SelectSearchItem<any>): void {
    this.setValue(item);
    this.closeModal();
  }

  onInfinite(event: InfiniteScrollCustomEvent): void {
    const p = this.payload();
    if (this.hasNextPage()) {
      this.loadMore.emit(p.page.number + 1);
    } else {
      void event.target.complete();
    }
  }

  writeValue(value: any): void {
    if (value === null || value === undefined) {
      this.selectedItem.set(null);
      return;
    }

    const found = this.items().find((i) => i.value === value);

    if (found) {
      this.selectedItem.set(found);
    } else {
      // TODO: Test
      // Logic for when value exists but isn't in the loaded list (e.g. page 1)
      // Ideally, the parent should pass the full object, or we display the raw value/placeholder
      // For now, we set a temporary object so the UI isn't empty
      this.selectedItem.set({ key: 'Loading...', value: value, objRef: null! });

      // OPTIONAL: Emit an event to ask parent to resolve this ID to a name
      // this.requestItemLabel.emit(value);
    }
  }

  registerOnChange(fn: any): void {
    this.sub = this.selectionChange.subscribe((val) => {
      fn(val?.value);
    });
  }

  registerOnTouched(fn: any): void {
    this.sub = this.onTouch.subscribe(() => fn());
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  private setValue(item: SelectSearchItem<any> | null): void {
    this.selectedItem.set(item);
    this.selectionChange.emit(item);

    if (this.clearOnSelect()) {
      this.selectedItem.set(null);
      this.searchTerm.set('');
    }
  }
}
