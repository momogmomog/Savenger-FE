import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { LoaderService } from './loader.service';
import { NgIf } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { ObjectUtils } from '../util/object-utils';
import { IonSpinner } from '@ionic/angular/standalone';
import { LoaderType } from './loader.type';

@Component({
  standalone: true,
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  imports: [NgIf, IonSpinner],
})
export class LoaderComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  active = false;

  @Input()
  loaderName?: string;

  @Input()
  loaderType = LoaderType.DOTS;

  constructor(
    private loaderService: LoaderService,
    private ref: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const sub = this.loaderService.loading$
      .pipe(
        filter((val) => {
          return (
            ObjectUtils.allNil([val.name, this.loaderName]) ||
            val.name === this.loaderName
          );
        }),
      )
      .subscribe((value) => {
        if (this.active === value.visible) {
          return;
        }

        this.active = value.visible;
        this.ref.detectChanges();
      });

    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
