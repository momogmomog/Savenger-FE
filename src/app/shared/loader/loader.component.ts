import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { LoaderService } from './loader.service';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs';
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
export class LoaderComponent implements OnInit {
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
    this.loaderService.loading$
      .pipe(
        filter(
          (val) =>
            ObjectUtils.allNil([val.name, this.loaderName]) ||
            val.name === this.loaderName,
        ),
      )
      .subscribe((value) => {
        if (this.active === value.visible) {
          return;
        }

        this.active = value.visible;
        this.ref.detectChanges();
      });
  }
}
